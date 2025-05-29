import Joi from "joi";
import validator from "../../utils/validator.js";
import Inquiry from "../../models/inquiryModel.js";
import responseHandler from "../../utils/responseHandler.js";
import Role from "../../models/roleModel.js";
import User from "../../models/userModel.js";

export default {
    validator: validator({
        query: Joi.object({
            page: Joi.number().optional(),
            limit: Joi.number().optional()
        })
    }),
    handler: async (req, res) => {
        try {
            const userRole = req.user.role;
            let inquiry;

            // Find role in role model
            const role = await Role.findOne({
                where: { id: userRole }
            });

            if (!role) {
                return responseHandler.error(res, "Role not found");
            }
            if (role.role_name === 'super-admin') {
                // If user is super-admin, get all inquiries
                inquiry = await Inquiry.findAll({
                    where: {
                        client_id: req.user.id
                    }
                });
            } else if (role.role_name === 'client') {
                // If user is client, find projects matching their client_id
                inquiry = await Inquiry.findAll({
                    where: {
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

                inquiry = await Inquiry.findAll({
                    where: {
                        client_id: user.client_id
                    }
                });
            }

            return responseHandler.success(res, "Inquiry fetched successfully", inquiry);

        } catch (error) {
            return responseHandler.error(res, error?.message);
        }
    }
}