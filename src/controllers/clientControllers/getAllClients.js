import Joi from "joi";
import User from "../../models/userModel.js";
import responseHandler from "../../utils/responseHandler.js";
import validator from "../../utils/validator.js";
import Role from "../../models/roleModel.js";

export default {
    validator: validator({
        query: Joi.object({
            page: Joi.number().optional(),
            limit: Joi.number().optional()
        })
    }),
    handler: async (req, res) => {
        try {
            const ClientRoleID = await Role.findOne({
                where: {
                    role_name: "client"
                }
            });
            const clients = await User.findAll({ where: { role_id: ClientRoleID.id } });
            if (clients) {
                return responseHandler.success(res, "Clients fetched successfully", clients);
            }
        } catch (error) {
            return responseHandler.error(res, error?.message);
        }
    }
}