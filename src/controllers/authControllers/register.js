import Joi from "joi";
import bcrypt from 'bcrypt';
import User from "../../models/userModel.js";
import Role from "../../models/roleModel.js";
import SubscriptionPlan from "../../models/subscriptionPlanModel.js";
import ClientSubscription from "../../models/clientSubscriptionModel.js";
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
                })
        })
    }),
    handler: async (req, res) => {
        try {
            const { username, email, password } = req.body;

            // Check if username already exists
            const existingUsername = await User.findOne({
                where: { username }
            });

            if (existingUsername) {
                return responseHandler.error(res, "Username already exists");
            }

            // Check if email already exists
            const existingEmail = await User.findOne({
                where: { email }
            });

            if (existingEmail) {
                return responseHandler.error(res, "Email already exists");
            }

            // Get client role
            const clientRole = await Role.findOne({
                where: { role_name: 'client' }
            });

            if (!clientRole) {
                return responseHandler.error(res, "Client role not found");
            }

            // Get default plan
            const defaultPlan = await SubscriptionPlan.findOne({
                where: { is_default: true }
            });

            if (!defaultPlan) {
                return responseHandler.error(res, "Default plan not found");
            }

            // Hash password
            const hashedPassword = await bcrypt.hash(password, 12);

            // Generate OTP
            const otp = generateOTP(OTP_CONFIG.LENGTH);

            // Create temp user object
            const tempUser = {
                username,
                email,
                password: hashedPassword,
                role_id: clientRole.id,
                verificationOTP: otp,
                verificationOTPExpiry: Date.now() + OTP_CONFIG.EXPIRY.DEFAULT,
                created_by: 'self-register',
                client_plan_id: defaultPlan.id
            };

            // Store in session
            const sessionToken = jwt.sign(
                {
                    ...tempUser,
                    type: 'register_verification'
                },
                JWT_SECRET,
                { expiresIn: '15m' }
            );

            // Send verification email
            const emailTemplate = getVerificationEmailTemplate(username, otp);
            await sendEmail(email, 'Verify Your Email', emailTemplate);

            return responseHandler.success(res, "Please verify your email to complete registration", { sessionToken });

        } catch (error) {
            console.error('Registration error:', error);
            return responseHandler.error(res, error?.message || "An error occurred during registration");
        }
    }
};
