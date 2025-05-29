import Joi from "joi";
import User from "../../models/userModel.js";
import validator from "../../utils/validator.js";
import responseHandler from "../../utils/responseHandler.js";
import { generateOTP } from "../../utils/otpService.js";
import sgMail, { sendEmail } from "../../utils/emailService.js";
import { getPasswordResetEmailTemplate } from "../../utils/emailTemplates.js";
import { EMAIL_FROM, OTP_CONFIG } from "../../config/config.js";
import jwt from "jsonwebtoken";
import { JWT_SECRET } from "../../config/config.js";

export default {
    validator: validator({
        body: Joi.object({
            email: Joi.string().email().required()
        })
    }),
    handler: async (req, res) => {
        try {
            const { email } = req.body;
            const user = await User.findOne({ where: { email: email } });

            if (!user) {
                return responseHandler.notFound(res, "User not found");
            }

            // Get the email to send OTP to
            let mailToSend = email;

            // If user has a client_id, try to get client's email
            if (user.client_id) {
                const clientMail = await User.findOne({ where: { id: user.client_id } });
                if (clientMail && clientMail.email) {
                    mailToSend = clientMail.email;
                }
            }

            const otp = generateOTP(OTP_CONFIG.LENGTH);
            user.resetPasswordOTP = otp;
            user.resetPasswordOTPExpiry = Date.now() + OTP_CONFIG.EXPIRY.RESET_PASSWORD;
            await user.save();

            const sessionToken = jwt.sign(
                { email: user.email },
                JWT_SECRET,
                { expiresIn: '15m' }
            );

            const emailTemplate = getPasswordResetEmailTemplate(user.username, otp);
            await sendEmail(mailToSend, 'Password Reset Request', emailTemplate);

            return responseHandler.success(res, "Password reset OTP sent to your email", { sessionToken });
        } catch (error) {
            console.error("Forgot password error:", error);
            return responseHandler.internalServerError(res, error?.message || "An error occurred while processing your request");
        }
    }
}; 