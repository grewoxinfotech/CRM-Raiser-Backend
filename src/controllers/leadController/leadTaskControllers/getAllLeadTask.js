import responseHandler from "../../../utils/responseHandler.js";
import Task from "../../../models/taskModel.js";
import Joi from "joi";
import validator from "../../../utils/validator.js";
import User from "../../../models/userModel.js";
import Role from "../../../models/roleModel.js";

export default {
    validator: validator({
        params: Joi.object({
            leadId: Joi.string().required()
        }),
        query: Joi.object({
            page: Joi.number().optional(),
            limit: Joi.number().optional()
        })
    }),
    handler: async (req, res) => {
        try {
            const userRole = req.user.role;
            const { leadId } = req.params;
            let tasks;

            // Find role in role model
            const role = await Role.findOne({
                where: { id: userRole }
            });

            if (!role) {
                return responseHandler.error(res, "Role not found");
            }

            if (role.role_name === 'client') {
                // If user is client, find tasks matching their client_id
                tasks = await Task.findAll({
                    where: {
                        leadId,
                        client_id: req.user.id
                    }
                });
            } else {
                // For other roles, get client_id from user model
                const user = await User.findOne({
                    where: { id: req.user.id }
                });

                if (!user) {
                    return responseHandler.error(res, "User not found");
                }

                tasks = await Task.findAll({
                    where: {
                        leadId,
                        client_id: user.client_id
                    }
                });
            }

            return responseHandler.success(res, "Lead tasks fetched successfully", tasks);
        } catch (error) {
            return responseHandler.error(res, error?.message);
        }
    }
}