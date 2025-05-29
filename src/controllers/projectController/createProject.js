import Joi from "joi";
import Project from "../../models/projectModel.js";
import validator from "../../utils/validator.js";
import responseHandler from "../../utils/responseHandler.js";

export default {
    validator: validator({
        body: Joi.object({
            project_name: Joi.string().required(),
            startDate: Joi.date().required(),
            endDate: Joi.date().required(),
            project_category: Joi.string().required(),
            project_description: Joi.string().allow('', null).optional(),
            project_members: Joi.object().allow(null).optional(),
            client: Joi.string().allow('', null).optional(),
            currency: Joi.string().allow('', null).optional(),
            budget: Joi.number().required(),
            estimatedmonths: Joi.string().allow('', null).optional(),
            estimatedhours: Joi.number().allow('', null).optional(),
            status: Joi.string().allow('', null).optional(),
            tag: Joi.string().allow('', null).optional(),
        })
    }),
    handler: async (req, res) => {
        try {
            const {
                project_name,
                startDate,
                endDate,
                project_category,
                project_description,
                project_members,
                client,
                currency,
                budget,
                estimatedmonths,
                estimatedhours,
                tag,
                status,
            } = req.body;

            const existingProject = await Project.findOne({
                where: { project_name }
            });

            if (existingProject) {
                return responseHandler.error(res, "Project with this name already exists");
            }

            const project = await Project.create({
                project_name,
                startDate,
                endDate,
                project_category,
                project_description,
                project_members,
                client,
                currency,
                budget,
                estimatedmonths,
                estimatedhours,
                tag,
                status,
                client_id: req.des?.client_id,
                created_by: req.user?.username,
            });

            return responseHandler.created(res, "Project created successfully", project);
        } catch (error) {

            return responseHandler.error(res, error?.message);
        }
    }
};