import Joi from "joi";
import validator from "../../utils/validator.js";
import Message from "../../models/messageModel.js";
import responseHandler from "../../utils/responseHandler.js";
import Role from "../../models/roleModel.js";
import User from "../../models/userModel.js";

export default {
    validator: validator({
        query: Joi.object({
            chooseMember: Joi.string().required()
        })
    }),
    handler: async (req, res) => {
        try {
            const { chooseMember } = req.query;
            const userRole = req.user.role;
            let messages;

            // Find role in role model
            const role = await Role.findOne({
                where: { id: userRole }
            });

            if (!role) {
                return responseHandler.error(res, "Role not found");
            }

            if (role.role_name === 'client') {
                // If user is client, find messages matching their client_id
                messages = await Message.findAll({
                    where: {
                        chooseMember,
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

                messages = await Message.findAll({
                    where: {
                        chooseMember,
                        client_id: user.client_id
                    }
                });
            }

            if (!messages) {
                return responseHandler.error(res, "No messages found");
            }

            return responseHandler.success(res, "Messages fetched successfully", messages);
        } catch (error) {
            return responseHandler.error(res, error?.message);
        }
    }
}
