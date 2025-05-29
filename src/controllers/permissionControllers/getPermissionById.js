import Joi from "joi";
import Permission from "../../models/permissionModel.js";
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

            const permission = await Permission.findByPk(id);

            if (!permission) {
                return responseHandler.notFound(res, "Permission not found");
            }

            return responseHandler.success(res, "Permission fetched successfully", permission);
        } catch (error) {

            return responseHandler.error(res, error?.message);
        }
    }
};
