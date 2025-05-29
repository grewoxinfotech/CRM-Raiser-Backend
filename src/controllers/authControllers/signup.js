import Joi from "joi";
import bcrypt from 'bcrypt';
import User from "../../models/userModel.js";
import Role from "../../models/roleModel.js";
import validator from "../../utils/validator.js";
import responseHandler from "../../utils/responseHandler.js";
import { generateOTP } from "../../utils/otpService.js";
import { OTP_CONFIG } from "../../config/config.js";
import jwt from "jsonwebtoken";
import { JWT_SECRET } from "../../config/config.js";
import { getVerificationEmailTemplate } from '../../utils/emailTemplates.js';
import { sendEmail } from "../../utils/emailService.js";
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
            role_id: Joi.string().required(),
        }),
    }),
    handler: async (req, res) => {
        try {
            const { username, password, email, role_id } = req.body;
            const { subscription } = req;

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
            const creatorRole = await Role.findByPk(req.user.role);
            if (!creatorRole) {
                return responseHandler.error(res, "Invalid creator role");
            }
            let client_id;
            let client_plan_id = subscription?.id;

            if (creatorRole.role_name === 'client') {
                client_id = req.user.id;
                const clientUser = await User.findByPk(req.user.id);
                if (clientUser?.client_plan_id) {
                    client_plan_id = clientUser.client_plan_id;
                }
            } else if (creatorRole.role_name === 'super-admin') {
                client_id = req.user.id;
            } else {
                const user = await User.findByPk(req.user.id);
                if (!user) {
                    return responseHandler.error(res, "User not found");
                }
                client_id = user.client_id;
                if (user?.client_plan_id) {
                    client_plan_id = user.client_plan_id;
                }
            }
            const otp = generateOTP(OTP_CONFIG.LENGTH);

            const hashedPassword = await bcrypt.hash(password, 12);
            const tempUser = {
                id: req.user.id,
                username,
                email,
                role_id,
                password: hashedPassword,
                verificationOTP: otp,
                verificationOTPExpiry: Date.now() + OTP_CONFIG.EXPIRY.DEFAULT,
                client_id,
                client_plan_id: client_plan_id,
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

            // Send verification email
            const emailTemplate = getVerificationEmailTemplate(username, otp);
            await sendEmail(req.user.email, 'Verify Your Email', emailTemplate);

            // // Send verification email
            // const emailTemplate = getVerificationEmailTemplate(username, otp);
            // await sgMail.send({
            //     to: req.user.email,
            //     from: EMAIL_FROM,
            //     subject: 'Verify Your Email',
            //     html: emailTemplate
            // });

            return responseHandler.success(res, "Please verify your email to complete registration", { sessionToken })

        } catch (error) {
            return responseHandler.error(res, error?.message);
        }
    }
};





