import Joi from "joi";
import Lead from "../../models/leadModel.js";
import validator from "../../utils/validator.js";
import responseHandler from "../../utils/responseHandler.js";

export default {
    validator: validator({
        params: Joi.object({
            id: Joi.string().required()
        }),
        body: Joi.object({
            lead_members: Joi.object({
                lead_members: Joi.array().items(Joi.string()).required()
            }).required()
        })
    }),
    handler: async (req, res) => {
        try {
            const { id } = req.params;
            const memberIdsToDelete = req.body.lead_members.lead_members;

            const lead = await Lead.findByPk(id);

            if (!lead) {
                return responseHandler.notFound(res, "Lead not found");
            }

            // Parse project_members if it's a string
            const currentLeadMembers = typeof lead.lead_members === 'string'
                ? JSON.parse(lead.lead_members)
                : lead.lead_members;

            // Get current members array
            const currentMembers = currentLeadMembers?.lead_members || [];

            // Check if all memberIds to delete exist in the project
            const nonExistingMembers = memberIdsToDelete.filter(id => !currentMembers.includes(id));
            if (nonExistingMembers.length > 0) {
                return responseHandler.error(res, `Some members not found in lead: ${nonExistingMembers.join(', ')}`);
            }

            // Create new array without the specified members
            const updatedMembers = currentMembers.filter(
                memberId => !memberIdsToDelete.includes(memberId)
            );

            // Update the project with the new members list
            await lead.update({
                lead_members: { lead_members: updatedMembers },
                updated_by: req.user?.username
            });

            return responseHandler.success(res, "Lead members deleted successfully", {
                lead_members: { lead_members: updatedMembers }
            });
        } catch (error) {

            return responseHandler.error(res, error?.message);
        }
    }
};

