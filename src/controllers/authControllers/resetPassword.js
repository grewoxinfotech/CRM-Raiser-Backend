import Joi from "joi";
import bcrypt from "bcrypt";
import User from "../../models/userModel.js";
import validator from "../../utils/validator.js";
import responseHandler from "../../utils/responseHandler.js";

export default {
    validator: validator({
        body: Joi.object({
            newPassword: Joi.string()
                .pattern(/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]{8,}$/)
                .required()
                .messages({
                    'string.pattern.base': 'create a strong password'
                })
        })
    }),
    handler: async (req, res) => {
        try {
            const { newPassword } = req.body;
            const user = req.user;

            const findUser = await User.findOne({
                where: {
                    email: user.email,
                }
            });

            if (!findUser) {
                return responseHandler.unauthorized(res, "Invalid reset token");
            }

            // Hash new password
            const hashedPassword = await bcrypt.hash(newPassword, 12);
            findUser.password = hashedPassword;
            findUser.resetPasswordOTP = undefined;
            findUser.resetPasswordOTPExpiry = undefined;
            await findUser.save();

            return responseHandler.success(res, "Password reset successful", findUser);
        } catch (error) {
            return responseHandler.internalServerError(res, error.message);
        }
    }
}; 