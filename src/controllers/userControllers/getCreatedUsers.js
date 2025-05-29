import Joi from "joi";
import Users from "../../models/userModel.js";
import Role from "../../models/roleModel.js";
import validator from "../../utils/validator.js";
import responseHandler from "../../utils/responseHandler.js";
import { Op } from "sequelize";

export default {
    validator: validator({
        query: Joi.object({
            page: Joi.number().optional(),
            limit: Joi.number().optional(),
        })
    }),
    handler: async (req, res) => {
        try {
            // First get all users
            const allUsers = await Users.findAll();

            // Get logged in user's client_id
            // Get logged in user's role
            const userRole = await Role.findOne({
                where: { id: req.user.role }

            });

            if (!userRole) {

                return responseHandler.notFound(res, "User role not found");
            }

            let clientId;
            if (userRole.role_name === 'client') {
                // If user is client, use their ID directly
                clientId = req.user.id;
            } else {
                // If not client, find the user's client_id
                const loggedInUser = await Users.findOne({
                    where: { id: req.user.id }
                });

                if (!loggedInUser) {
                    return responseHandler.notFound(res, "Logged in user not found");
                }

                clientId = loggedInUser.client_id;
            }

            // Filter users created by the determined client_id
            const createdUsers = allUsers.filter(user => user.client_id === clientId);

            if (!createdUsers || createdUsers.length === 0) {
                return responseHandler.notFound(res, "No users found");
            }

            // Get role IDs of filtered users
            const roleIds = createdUsers.map(user => user.role_id);

            // Get roles for filtered users
            const roles = await Role.findAll({
                where: {
                    id: roleIds,
                    role_name: {
                        [Op.notIn]: ['client', 'sub-client', 'super-admin']
                    }
                }
            });

            // Filter users based on valid roles
            const validRoleIds = roles.map(role => role.id);
            const finalUsers = createdUsers.filter(user => 
                validRoleIds.includes(user.role_id) && 
                user.role_id !== req.user.role_id
            );

            if (!finalUsers || finalUsers.length === 0) {
                return responseHandler.notFound(res, "No users found with valid roles");
            }

            // Add role details to final users
            const usersWithRoles = finalUsers.map(user => {
                const userRole = roles.find(role => role.id === user.role_id);
                return {
                    ...user.toJSON(),
                    Role: userRole
                };
            });

            return responseHandler.success(res, "Users fetched successfully", usersWithRoles);
        } catch (error) {
            return responseHandler.error(res, error?.message);
        }
    }
}
