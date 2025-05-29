import Joi from "joi";
import Deal from "../../models/dealModel.js";
import Activity from "../../models/activityModel.js";
import responseHandler from "../../utils/responseHandler.js";
import validator from "../../utils/validator.js";
import uploadToS3 from "../../utils/uploadToS3.js";
import User from "../../models/userModel.js";

export default {
    validator: validator({
        params: Joi.object({
            id: Joi.string().required()
        }),
        body: Joi.object({
            dealTitle: Joi.string().optional(),
            currency: Joi.string().optional(),
            value: Joi.number().optional(),
            pipeline: Joi.string().optional(),
            stage: Joi.string().optional(),
            status: Joi.string().valid('won', 'lost', 'pending').optional(),
            category: Joi.string().optional().allow(null),
            source: Joi.string().optional().allow(null),
            closedDate: Joi.date().optional().allow(null),
            company_id: Joi.string().optional().allow(null),
            contact_id: Joi.string().optional().allow(null),
            deal_members: Joi.object().optional().allow(null),
            files: Joi.array().items(Joi.object({
                filename: Joi.string().required(),
                url: Joi.string().required()
            })).optional(),
            client_id: Joi.string().optional(),
            is_won: Joi.boolean().optional().allow(null)
        })
    }),
    handler: async (req, res) => {
        try {
            const { id } = req.params;
            const updateData = req.body;
            const uploadedFiles = req.files?.deal_files || [];

            const deal = await Deal.findByPk(id);
            if (!deal) {
                return responseHandler.notFound(res, "Deal not found");
            }

            // Handle file uploads if present
            if (uploadedFiles.length > 0) {
                const currentFiles = typeof deal.files === 'string'
                    ? JSON.parse(deal.files)
                    : deal.files || [];

                const duplicateFiles = uploadedFiles.filter(newFile =>
                    currentFiles.some(existingFile => existingFile.filename === newFile.originalname)
                );

                if (duplicateFiles.length > 0) {
                    return responseHandler.error(res, `These files already exist in deal: ${duplicateFiles.map(f => f.originalname).join(', ')}`);
                }

                const processedFiles = await Promise.all(
                    uploadedFiles.map(async (file) => {
                        const url = await uploadToS3(file, "deal-files", file.originalname, req.user?.username);
                        return {
                            filename: file.originalname,
                            url: url
                        };
                    })
                );

                updateData.files = [...currentFiles, ...processedFiles];
            }

            // Check if deal members are being updated
            if (updateData.deal_members) {
                const currentDealMembers = typeof deal.deal_members === 'string'
                    ? JSON.parse(deal.deal_members)
                    : deal.deal_members || { deal_members: [] };

                const currentMembers = currentDealMembers.deal_members || [];
                const newMembers = updateData.deal_members.deal_members || [];

                // Find newly added members
                const addedMembers = newMembers.filter(memberId => !currentMembers.includes(memberId));

                // Create activity for each newly added member
                if (addedMembers.length > 0) {
                    // Fetch member names from User model
                    const memberUsers = await User.findAll({
                        where: {
                            id: addedMembers
                        },
                        attributes: ['id', 'username']
                    });

                    const memberNames = memberUsers.map(user => user.username).join(', ');

                    await Activity.create({
                        related_id: id,
                        activity_from: "deal_member",
                        activity_id: deal.id,
                        action: "added",
                        performed_by: req.user?.username,
                        client_id: req.des?.client_id,
                        activity_message: `Members ${memberNames} added to deal successfully`
                    });
                }
            }

            await deal.update({
                ...updateData,
                updated_by: req.user?.username
            });

            return responseHandler.success(res, "Deal updated successfully", deal);
        } catch (error) {
            return responseHandler.error(res, error?.message);
        }
    }
}