import Project from "../../models/projectModel.js";
import Joi from "joi";
import validator from "../../utils/validator.js";
import responseHandler from "../../utils/responseHandler.js";

export default {
    validator: validator({
        params: Joi.object({
            id: Joi.string().required()
        })
    }),
    handler: async (req, res) => {
        try {
            const { id } = req.params;
            const project = await Project.findByPk(id);
            if (!project) {
                return responseHandler.notFound(res, "Project not found");
            }
            return responseHandler.success(res, "Project fetched successfully", project);
        }
        catch (error) {
            return responseHandler.error(res, error?.message);
        }
    }
}