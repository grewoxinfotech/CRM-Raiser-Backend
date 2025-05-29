import Joi from "joi";
import responseHandler from "../../utils/responseHandler.js";
import validator from "../../utils/validator.js";
import User from "../../models/userModel.js";
import { generateOTP } from "../../utils/otpService.js";
import { OTP_CONFIG, EMAIL_FROM } from "../../config/config.js";
import jwt from "jsonwebtoken";
import { JWT_SECRET } from "../../config/config.js";
import { getVerificationEmailTemplate } from '../../utils/emailTemplates.js';
import sgMail from "../../utils/emailService.js";

export default {
    validator: validator({
        params: Joi.object({
            id: Joi.string().required()
        }),
        body: Joi.object({
            email: Joi.string().email().required()
        })
    }),
    handler: async (req, res) => {
        try {
            const { id } = req.params;
            const { email } = req.body;

            const client = await User.findByPk(id);
            if (!client) {
                return responseHandler.notFound(res, "Client not found");
            }

            // Check if email is being changed
            if (email === client.email) {
                return responseHandler.error(res, "New email must be different from current email");
            }

            const existingEmail = await User.findOne({
                where: { email }
            });

            if (existingEmail) {
                return responseHandler.error(res, "Email already exists.");
            }

            // Generate OTP for email verification
            const otp = generateOTP(OTP_CONFIG.LENGTH);

            const tempUser = {
                id: client.id,
                username: client.username,
                email,
                verificationOTP: otp,
                verificationOTPExpiry: Date.now() + OTP_CONFIG.EXPIRY.DEFAULT,
            };

            const sessionToken = jwt.sign(
                {
                    ...tempUser,
                    type: 'email_verification'
                },
                JWT_SECRET,
                { expiresIn: '15m' }
            );

            // Send verification email
            const emailTemplate = getVerificationEmailTemplate(client.username, otp);
            await sgMail.send({
                to: email,
                from: EMAIL_FROM,
                subject: 'Verify Your Email',
                html: emailTemplate
            });

            return responseHandler.success(res, "Please verify your new email address", { sessionToken });

        } catch (error) {
            return responseHandler.error(res, error?.message);
        }
    }
};