import Joi from "joi";
import SuperAdmin from "../../models/superAdminModel.js";
import responseHandler from "../../utils/responseHandler.js";
import validator from "../../utils/validator.js";

export default {
    validator: validator({
        params: Joi.object({
            id: Joi.string().required()
        })
    }),
    handler: async (req, res) => {
        try {
            const { id } = req.params;

            const superAdmin = await SuperAdmin.findByPk(id);
            if (!superAdmin) {
                return responseHandler.error(res, "superAdmin not found");
            }
            return responseHandler.success(res, "superAdmin fetched successfully", superAdmin);
        } catch (error) {
            return responseHandler.error(res, error?.message);
        }
    }
}
