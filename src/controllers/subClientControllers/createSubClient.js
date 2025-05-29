import Joi from "joi";
import bcrypt from 'bcrypt';
import validator from "../../utils/validator.js";
import responseHandler from "../../utils/responseHandler.js";
import Role from "../../models/roleModel.js";
import generateId from "../../middlewares/generatorId.js";
import User from "../../models/userModel.js";
import sgMail from '../../utils/emailService.js';
import { generateOTP } from "../../utils/otpService.js";
import { EMAIL_FROM, OTP_CONFIG } from "../../config/config.js";
import jwt from "jsonwebtoken";
import { JWT_SECRET } from "../../config/config.js";
import { getVerificationEmailTemplate } from '../../utils/emailTemplates.js';

export default {
    validator: validator({
        body: Joi.object({
            username: Joi.string().required(),
            email: Joi.string().email().required(),
            password: Joi.string()
                .required()
                .min(8)
                .pattern(new RegExp('^[a-zA-Z0-9!@#$%^&*]{8,30}$'))
                .messages({
                    'string.pattern.base': 'Create a strong password',
                    'string.min': 'Password must be at least 8 characters long',
                    'string.empty': 'Password is required'
                }),
        }),
    }),
    handler: async (req, res) => {
        try {
            const { subscription } = req;
            const { username, email, password } = req.body;



            const existingUsername = await User.findOne({
                where: { username }
            });

            if (existingUsername) {
                return responseHandler.error(res, "Username already exists.");
            }

            const existingEmail = await User.findOne({
                where: { email }
            });

            if (existingEmail) {
                return responseHandler.error(res, "Email already exists.");
            }

            const existingRole = await Role.findOne({
                where: {
                    role_name: 'sub-client',
                    client_id: req.des.client_id,
                    created_by: req.user.username
                }
            });

            let role;
            if (!existingRole) {
                role = await Role.create({
                    id: generateId(),
                    role_name: 'sub-client',
                    client_id: req.des.client_id,
                    created_by: req.user.username
                });
            } else {
                role = existingRole;
            }

            // const creatorRole = await Role.findByPk(req.user?.role);
            // if (!creatorRole) {
            //     return responseHandler.error(res, "Invalid creator role");
            // }


            // let client_id;
            // if (creatorRole.role_name === 'client') {
            //     client_id = req.user.id;
            // } else if (creatorRole.role_name === 'super-admin') {
            //     client_id = req.user.id;
            // } else {
            //     client_id = req.user.client_id;

            // }
            // Generate OTP
            const otp = generateOTP(OTP_CONFIG.LENGTH);

            const hashedPassword = await bcrypt.hash(password, 12);

            // Create temporary user record
            const tempUser = {
                id: req.user.id,
                username,
                email,
                role_id: role.id,
                password: hashedPassword,
                verificationOTP: otp,
                client_id: req.des?.client_id,
                verificationOTPExpiry: Date.now() + OTP_CONFIG.EXPIRY.DEFAULT,
                created_by: req.user?.username
            };

            // Store in session
            const sessionToken = jwt.sign(
                {
                    ...tempUser,
                    ...subscription,
                    type: 'signup_verification'
                },
                JWT_SECRET,
                { expiresIn: '15m' }
            );

            console.log(req.user.email);
            // Send verification email
            const emailTemplate = getVerificationEmailTemplate(username, otp);
            await sgMail.send({
                to: req.user.email,
                from: EMAIL_FROM,
                subject: 'Verify Your Email',
                html: emailTemplate
            });

            return responseHandler.success(res, "Please verify your email to complete registration", { sessionToken });

        } catch (error) {
            return responseHandler.error(res, error?.message);
        }
    }
}