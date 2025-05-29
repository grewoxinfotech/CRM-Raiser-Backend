import bcrypt from "bcrypt";
import Joi from "joi";
import SuperAdmin from "../../models/superAdminModel.js";
import Role from "../../models/roleModel.js";
import validator from "../../utils/validator.js";
import responseHandler from "../../utils/responseHandler.js";
import generateId from "../../middlewares/generatorId.js";
import { SUPER_ADMIN_SECRET_KEY } from '../../config/config.js'

export default {
    validator: validator({
        body: Joi.object({
            username: Joi.string().required()
                .min(3)
                .max(30)
                .messages({
                    'string.empty': 'Username is required',
                    'string.min': 'Username must be at least 3 characters',
                    'string.max': 'Username cannot exceed 30 characters'
                }),
            email: Joi.string().email().required()
                .messages({
                    'string.empty': 'Email is required',
                    'string.email': 'Please enter a valid email'
                }),
            password: Joi.string().required()
                .min(8)
                .pattern(/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]{8,}$/)
                .messages({
                    'string.empty': 'Password is required',
                    'string.min': 'Password must be at least 8 characters',
                    'string.pattern.base': 'Password must contain at least one uppercase letter, one lowercase letter, one number and one special character'
                }),
            secret_key: Joi.string().required()
                .messages({
                    'string.empty': 'Secret key is required'
                })
        })
    }),
    handler: async (req, res) => {
        try {
            const { username, email, password, secret_key } = req.body;

            if (secret_key !== SUPER_ADMIN_SECRET_KEY) {
                return responseHandler.unauthorized(res, "Invalid secret key");
            }


            const existingUsername = await SuperAdmin.findOne({ where: { username } });
            if (existingUsername) {
                return responseHandler.error(res, "Username already exists");
            }

            const existingEmail = await SuperAdmin.findOne({ where: { email } });
            if (existingEmail) {
                return responseHandler.error(res, "Email already exists");
            }

            const [role] = await Role.findOrCreate({
                where: { role_name: 'super-admin' },
                defaults: { id: generateId() }
            });

            const hashedPassword = await bcrypt.hash(password, 10);

            const superAdmin = await SuperAdmin.create({
                id: generateId(),
                username,
                email,
                password: hashedPassword,
                role_id: role.id,
            });

            return responseHandler.created(res, "Super admin created successfully", superAdmin);
        } catch (error) {
            return responseHandler.error(res, error?.message);
        }
    }
}; 