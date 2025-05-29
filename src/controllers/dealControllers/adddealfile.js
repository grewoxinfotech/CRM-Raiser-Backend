import Joi from "joi";
import Deal from "../../models/dealModel.js";
import Activity from "../../models/activityModel.js";
import validator from "../../utils/validator.js";
import responseHandler from "../../utils/responseHandler.js";
import uploadToS3 from "../../utils/uploadToS3.js";
import { Op } from "sequelize";

export default {
    validator: validator({
        params: Joi.object({
            id: Joi.string().required()
        })
    }),
    handler: async (req, res) => {
        try {
            const { id } = req.params;
            const uploadedFiles = req.files?.deal_files || [];

            if (!uploadedFiles.length) {
                return responseHandler.error(res, "No files uploaded");
            }

            const deal = await Deal.findByPk(id);

            if (!deal) {
                return responseHandler.notFound(res, "Deal not found");
            }

            // Parse existing files if it's a string
            const currentFiles = typeof deal.files === 'string'
                ? JSON.parse(deal.files)
                : deal.files || [];

            // Check for duplicate filenames
            const duplicateFiles = uploadedFiles.filter(newFile =>
                currentFiles.some(existingFile => existingFile.filename === newFile.originalname)
            );

            if (duplicateFiles.length > 0) {
                return responseHandler.error(res, `These files already exist in deal: ${duplicateFiles.map(f => f.originalname).join(', ')}`);
            }

            // Upload files to S3 and create file entries
            const processedFiles = await Promise.all(
                uploadedFiles.map(async (file) => {
                    const url = await uploadToS3(file, "client", "deal-files", req.user?.username);
                    return {
                        filename: file.originalname,
                        url: url
                    };
                })
            );

            // Combine existing files with new files
            const updatedFiles = [...currentFiles, ...processedFiles];

            // Update the project with the new files list
            await deal.update({
                files: updatedFiles,
                updated_by: req.user?.username
            });

            // Create activity for each uploaded file
            await Promise.all(processedFiles.map(file => 
                Activity.create({
                    related_id: id,
                    activity_from: "deal_file",
                    activity_id: deal.id,
                    action: "uploaded",
                    performed_by: req.user?.username,
                    client_id: req.des?.client_id,
                    activity_message: `File ${file.filename} uploaded to deal successfully`
                })
            ));

            return responseHandler.success(res, "Deal files added successfully", {
                files: updatedFiles
            });
        } catch (error) {
            return responseHandler.error(res, error?.message);
        }
    }
};