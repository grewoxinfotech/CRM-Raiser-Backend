import Joi from "joi";
import validator from "../../utils/validator.js";
import Project from "../../models/projectModel.js";
import responseHandler from "../../utils/responseHandler.js";

export default {
    validator: validator({
        params: Joi.object({
            id: Joi.string().required()
        }),
        query: Joi.object({
            page: Joi.number().optional(),
            limit: Joi.number().optional()
        })
    }),
    handler: async (req, res) => {
        try {
            const { id } = req.params;
            const projects = await Project.findAll({
                where: {
                    client: id
                },
            });
            return responseHandler.success(res, "Projects fetched successfully", projects);
        }
        catch (error) {
            return responseHandler.error(res, error?.message);
        }
    }
}