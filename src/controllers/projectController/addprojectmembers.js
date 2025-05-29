import Joi from "joi";
import Project from "../../models/projectModel.js";
import validator from "../../utils/validator.js";
import responseHandler from "../../utils/responseHandler.js";
import { Op } from "sequelize";
import sequelize from "../../config/db.js";


export default {
    validator: validator({
        params: Joi.object({
            id: Joi.string().required()
        }),
        body: Joi.object({
            project_members: Joi.object({
                project_members: Joi.array().items(Joi.string()).optional()
            }).optional()
        })
    }),
    handler: async (req, res) => {
        try {
            const { id } = req.params;
            const { project_members } = req.body;

            // Safely access project_members array from the payload
            const newMemberIds = project_members?.project_members || [];

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

            // Check for duplicate members
            const duplicateMembers = newMemberIds.filter(id => currentMembers.includes(id));
            if (duplicateMembers.length > 0) {
                return responseHandler.error(res, `These members already exist in project: ${duplicateMembers.join(', ')}`);
            }

            // Combine existing members with new members
            const updatedMembers = [...currentMembers, ...newMemberIds];


            // const existingProjectMembers = await Project.findOne({ where: { project_members: { project_members: updatedMembers, id: { [Op.not]: project.id } } } });


            const existingProjectMembers = await Project.findOne({
                where: {
                    [Op.and]: [
                        sequelize.literal(`JSON_SEARCH(project_members, 'one', '${JSON.stringify(updatedMembers)}') IS NOT NULL`),
                        { id: { [Op.not]: project.id } }
                    ]
                }
            });
            if (existingProjectMembers) {
                return responseHandler.error(res, "Project members already exist");
            }
            // Update the project with the new members list
            await project.update({
                project_members: { project_members: updatedMembers },
                updated_by: req.user?.username
            });

            return responseHandler.success(res, "Project members added successfully", {
                project_members: { project_members: updatedMembers }
            });
        } catch (error) {

            return responseHandler.error(res, error?.message);
        }
    }
};
