import Joi from "joi";
import Project from "../../models/projectModel.js";
import validator from "../../utils/validator.js";
import responseHandler from "../../utils/responseHandler.js";

export default {
    validator: validator({
        params: Joi.object({
            id: Joi.string().required()
        }),
        body: Joi.object({
            project_members: Joi.object({
                project_members: Joi.array().items(Joi.string()).required()
            }).required()
        })
    }),
    handler: async (req, res) => {
        try {
            const { id } = req.params;
            const memberIdsToDelete = req.body.project_members.project_members;

            const project = await Project.findByPk(id);

            if (!project) {
                return responseHandler.notFound(res, "Project not found");
            }

            // Parse project_members if it's a string
            const currentProjectMembers = typeof project.project_members === 'string'
                ? JSON.parse(project.project_members)
                : project.project_members;

            // Get current members array
            const currentMembers = currentProjectMembers?.project_members || [];

            // Check if all memberIds to delete exist in the project
            const nonExistingMembers = memberIdsToDelete.filter(id => !currentMembers.includes(id));
            if (nonExistingMembers.length > 0) {
                return responseHandler.error(res, `Some members not found in project: ${nonExistingMembers.join(', ')}`);
            }

            // Create new array without the specified members
            const updatedMembers = currentMembers.filter(
                memberId => !memberIdsToDelete.includes(memberId)
            );

            // Update the project with the new members list
            await project.update({
                project_members: { project_members: updatedMembers },
                updated_by: req.user?.username
            });

            return responseHandler.success(res, "Project members deleted successfully", {
                project_members: { project_members: updatedMembers }
            });
        } catch (error) {

            return responseHandler.error(res, error?.message);
        }
    }
};






