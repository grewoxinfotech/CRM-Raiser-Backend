import jwt from "jsonwebtoken";
import { EMAIL_FROM, JWT_SECRET, OTP_CONFIG } from "../../config/config.js";
import { generateOTP } from "../../utils/otpService.js";
import { getVerificationEmailTemplate } from "../../utils/emailTemplates.js";
import responseHandler from "../../utils/responseHandler.js";
import { sendEmail } from "../../utils/emailService.js";

export default {
    handler: async (req, res) => {
        try {
            const { user } = req;

            if (user.type !== 'signup_verification' && user.type !== 'register_verification') {
                return responseHandler.unauthorized(res, "Invalid verification token");
            }

            const newOTP = generateOTP(OTP_CONFIG.LENGTH);

            // Update user object with new OTP
            user.verificationOTP = newOTP;
            user.verificationOTPExpiry = Date.now() + OTP_CONFIG.EXPIRY.DEFAULT;

            const newSessionToken = jwt.sign(
                {
                    ...user,
                    type: user.type
                },
                JWT_SECRET
            );

            const emailTemplate = getVerificationEmailTemplate(user.username, newOTP);
            await sendEmail(user.email, 'Verify Your Email', emailTemplate);

            // const emailTemplate = getVerificationEmailTemplate(user.username, newOTP);
            // await sgMail.send({
            //     to: user.email,
            //     from: EMAIL_FROM,
            //     subject: 'Verify Your Email',
            //     html: emailTemplate
            // });

            return responseHandler.success(res, "New OTP sent successfully", { sessionToken: newSessionToken });
        } catch (error) {
            return responseHandler.internalServerError(res, error.message);
        }
    }
}; 