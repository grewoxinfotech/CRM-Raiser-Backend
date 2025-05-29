import Joi from "joi";
import jwt from 'jsonwebtoken';
import User from "../../models/userModel.js";
import SuperAdmin from "../../models/superAdminModel.js";
import { JWT_SECRET } from "../../config/config.js";
import responseHandler from "../../utils/responseHandler.js";
import validator from "../../utils/validator.js";
import { Op } from "sequelize";

export default {
    validator: validator({
        body: Joi.object({
            login: Joi.string().required(),
        })
    }),
    handler: async (req, res) => {
        try {
            const { login } = req.body;

            // Check if the login (email/username) exists in either SuperAdmin or User
            const entities = await Promise.all([
                SuperAdmin.findOne({ where: { [Op.or]: [{ email: login }, { username: login }] } }),
                User.findOne({ where: { [Op.or]: [{ email: login }, { username: login }] } }),
            ]);

            // Find the entity that exists
            const foundEntity = entities.find(entity => entity);

            // If no entity is found, return an error message
            if (!foundEntity) {
                return responseHandler.error(res, "Account not found");
            }

            // Generate a JWT token for the found entity
            const token = jwt.sign({
                username: foundEntity.username,
                email: foundEntity.email,
                id: foundEntity.id,
                role: foundEntity.role_id
            }, JWT_SECRET, { expiresIn: '24h' });

            // Return the token and user info
            return responseHandler.success(res, "Login successful", { token, user: foundEntity });

        } catch (error) {
            return responseHandler.error(res, error?.message);
        }
    }
}
