import Joi from "joi";
import validator from "../../utils/validator.js";
import Project from "../../models/projectModel.js";
import responseHandler from "../../utils/responseHandler.js";
import User from "../../models/userModel.js";
import Role from "../../models/roleModel.js";

export default {
    validator: validator({
        query: Joi.object({
            page: Joi.number(),
            limit: Joi.number()
        })
    }),
    handler: async (req, res) => {
        try {
            const userRole = req.user.role;
            let projects;

            // Find role in role model
            const role = await Role.findOne({
                where: { id: userRole }
            });

            if (!role) {
                return responseHandler.error(res, "Role not found");
            }

            if (role.role_name === 'client') {
                // If user is client, find projects matching their client_id
                projects = await Project.findAll({
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

                projects = await Project.findAll({
                    where: {
                        client_id: user.client_id
                    }
                });
            }

            return responseHandler.success(res, "Projects fetched successfully", projects);
        }
        catch (error) {
            return responseHandler.error(res, error?.message);
        }
    }
}