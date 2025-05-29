import Joi from "joi";
import responseHandler from "../../utils/responseHandler.js";
import validator from "../../utils/validator.js";
import User from "../../models/userModel.js";
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
            const SubClientRoleID = await Role.findOne({
                where: {
                    role_name: "sub-client",
                    created_by: req.user.username

                }
            });

     
            const subClients = await User.findAll({
                where: {
                    role_id: SubClientRoleID.id,
                    // created_by: req.user.username
                }
            });

            return responseHandler.success(res, "SubClients fetched successfully", subClients);
        } catch (error) {
            return responseHandler.error(res, error?.message);
        }
    }
}