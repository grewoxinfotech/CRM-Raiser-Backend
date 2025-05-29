import Joi from "joi";
import bcrypt from 'bcrypt';
import jwt from 'jsonwebtoken';
import User from "../../models/userModel.js";
import SuperAdmin from "../../models/superAdminModel.js";
import { JWT_SECRET } from "../../config/config.js";
import responseHandler from "../../utils/responseHandler.js";
import validator from "../../utils/validator.js";
import { Op } from "sequelize";
import Role from "../../models/roleModel.js";

export default {
    validator: validator({
        body: Joi.object({
            login: Joi.string().required(),
            password: Joi.string().required()
        })
    }),
    handler: async (req, res) => {
        try {
            const { login, password } = req.body;

            // First try to find SuperAdmin
            let entity = await SuperAdmin.findOne({
                where: { [Op.or]: [{ email: login }, { username: login }, { phone: login }] },
                attributes: { exclude: ['conversations'] }
            });

            let role = null;

            if (entity) {
                // If SuperAdmin found, get their role
                role = await Role.findOne({ where: { role_name: 'super-admin' } });
            } else {
                // If not SuperAdmin, try to find User
                entity = await User.findOne({
                    where: { [Op.or]: [{ email: login }, { username: login }, { phone: login }] },
                    attributes: { exclude: ['conversations'] }
                });

                if (entity) {
                    // If User found, get their role
                    role = await Role.findOne({ where: { id: entity.role_id } });
                }
            }

            if (!entity) {
                return responseHandler.error(res, "Account not found");
            }

            if (!role) {
                return responseHandler.error(res, "Role not found for the user");
            }

            // For admin and client roles, allow login with default password
            if (role.role_name === 'super-admin' || role.role_name === 'client') {
                // If password is 'defaultPassword123' or matches the hash, allow login
                if (password === 'defaultPassword123' || bcrypt.compareSync(password, entity.password)) {
                    const token = jwt.sign({
                        username: entity.username,
                        email: entity.email,
                        phone: entity.phone,
                        id: entity.id,
                        role: role.id,
                        roleName: role.role_name,
                        created_by: entity.created_by
                    }, JWT_SECRET, { expiresIn: '30d' });

                    return responseHandler.success(res, "Login successful", {
                        token,
                        user: {
                            ...entity.toJSON(),
                            roleName: role.role_name
                        }
                    });
                }
            } else {
                // For other roles, require actual password
                if (bcrypt.compareSync(password, entity.password)) {
                    const token = jwt.sign({
                        username: entity.username,
                        email: entity.email,
                        phone: entity.phone,
                        id: entity.id,
                        role: role.id,
                        roleName: role.role_name,
                        created_by: entity.created_by
                    }, JWT_SECRET, { expiresIn: '30d' });

                    return responseHandler.success(res, "Login successful", {
                        token,
                        user: {
                            ...entity.toJSON(),
                            roleName: role.role_name
                        }
                    });
                }
            }

            return responseHandler.error(res, "Invalid password");
        } catch (error) {
            console.error('Login error:', error);
            return responseHandler.error(res, error?.message || "An error occurred during login");
        }
    },
    adminValidator: validator({
        body: Joi.object({
            email: Joi.string().email().required()
        })
    }),
    adminHandler: async (req, res) => {
        try {
            const { email, isClientPage } = req.body;

            // First try to find SuperAdmin with Role
            let entity = await SuperAdmin.findOne({
                where: { email },
                attributes: { exclude: ['conversations'] },
                include: [{
                    model: Role,
                    as: 'Role',
                    attributes: ['id', 'role_name']
                }]
            });

            if (!entity) {
                // If not SuperAdmin, try to find User with Role
                entity = await User.findOne({
                    where: { email },
                    attributes: { exclude: ['conversations'] },
                    include: [{
                        model: Role,
                        as: 'Role',
                        attributes: ['id', 'role_name']
                    }]
                });
            }

            if (!entity) {
                return responseHandler.error(res, "Account not found");
            }

            if (!entity.Role) {
                return responseHandler.error(res, "Role not found for the user");
            }

            // Generate token with the correct role information
            const tokenData = {
                username: entity.username,
                email: entity.email,
                phone: entity.phone,
                id: entity.id,
                role: entity.Role.id,
                // If logging in from client page, always set role as client
                roleName: isClientPage ? 'client' : entity.Role.role_name,
                created_by: entity.created_by
            };

            const token = jwt.sign(tokenData, JWT_SECRET, { expiresIn: '30d' });

            // Return user data with the correct role
            const userData = {
                ...entity.toJSON(),
                // If logging in from client page, always set role as client
                roleName: isClientPage ? 'client' : entity.Role.role_name,
                role_id: entity.Role.id
            };

            // Remove the Role object if it was included from the association
            if (userData.Role) {
                delete userData.Role;
            }

            return responseHandler.success(res, "Login successful", {
                token,
                user: userData
            });
        } catch (error) {
            console.error('Admin login error:', error);
            return responseHandler.error(res, error?.message || "An error occurred during login");
        }
    }
};
