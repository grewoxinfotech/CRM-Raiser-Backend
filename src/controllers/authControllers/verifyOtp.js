import Joi from "joi";
import User from "../../models/userModel.js";
import validator from "../../utils/validator.js";
import responseHandler from "../../utils/responseHandler.js";
import jwt from "jsonwebtoken";
import { JWT_SECRET } from "../../config/config.js";
import { Op } from "sequelize";

export default {
    validator: validator({
        body: Joi.object({
            otp: Joi.string().length(6).required()
        })
    }),
    handler: async (req, res) => {
        try {
            const { otp } = req.body;
            const user = req.user;

            const findUser = await User.findOne({
                where: {
                    email: user.email,
                    resetPasswordOTP: otp,
                    resetPasswordOTPExpiry: { [Op.gt]: new Date().toISOString() }
                }
            });

            if (!findUser) {
                return responseHandler.unauthorized(res, "Invalid or expired OTP");
            }

            const resetToken = jwt.sign(
                { userId: user.id, email: user.email },
                JWT_SECRET,
                { expiresIn: '15m' }
            );

            return responseHandler.success(res, "OTP verified successfully", { token: resetToken });
        } catch (error) {
            return responseHandler.internalServerError(res, "Failed to verify OTP");
        }
    }
};