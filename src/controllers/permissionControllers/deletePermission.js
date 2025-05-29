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

            await permission.destroy();
            return responseHandler.success(res, "Permission deleted successfully");
        } catch (error) {

            return responseHandler.error(res, error?.message);
        }
    }
};
