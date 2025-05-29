import Joi from "joi";
import SuperAdmin from "../../models/superAdminModel.js";
import responseHandler from "../../utils/responseHandler.js";
import validator from "../../utils/validator.js";

export default {
    validator: validator({
        query: Joi.object({
            page: Joi.number().optional(),
            limit: Joi.number().optional()
        })
    }),
    handler: async (req, res) => {
        try {
            const superAdmins = await SuperAdmin.findAll();
            return responseHandler.success(res, "Super Admins fetched successfully", superAdmins);
        } catch (error) {

            return responseHandler.error(res, error?.message);
        }
    }
};
