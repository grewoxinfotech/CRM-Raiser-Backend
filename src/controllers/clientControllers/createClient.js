import Joi from "joi";
import bcrypt from "bcrypt";
import Role from "../../models/roleModel.js";
import validator from "../../utils/validator.js";
import responseHandler from "../../utils/responseHandler.js";
import generateId from "../../middlewares/generatorId.js";
import sgMail, { sendEmail } from '../../utils/emailService.js';
import { generateOTP } from "../../utils/otpService.js";
import { EMAIL_FROM, OTP_CONFIG } from "../../config/config.js";
import jwt from "jsonwebtoken";
import { JWT_SECRET } from "../../config/config.js";
import { getVerificationEmailTemplate } from "../../utils/emailTemplates.js";
import User from "../../models/userModel.js";

export default {
  validator: validator({
    body: Joi.object({
      username: Joi.string().required(),
      email: Joi.string().email().required(),
      password: Joi.string()
        .required()
        .min(8)
        .pattern(new RegExp("^[a-zA-Z0-9!@#$%^&*]{8,30}$"))
        .messages({
          "string.pattern.base": "Create a strong password",
          "string.min": "Password must be at least 8 characters long",
          "string.empty": "Password is required",
        })
    })
  }),
  handler: async (req, res) => {
    try {
      const { username, email, password } = req.body;

      const existingUsername = await User.findOne({
        where: { username },
      });

      if (existingUsername) {
        return responseHandler.error(res, "Username already exists.");
      }

      const existingEmail = await User.findOne({
        where: { email },
      });

      if (existingEmail) {
        return responseHandler.error(res, "Email already exists.");
      }

      const [role] = await Role.findOrCreate({
        where: { role_name: "client" },
        defaults: { id: generateId() },
      });

      const creatorRole = await Role.findByPk(req.user?.role);
      if (!creatorRole) {
        return responseHandler.error(res, "Invalid creator role");
      }

      let client_id;
      if (creatorRole.role_name === "client") {
        client_id = req.user.id;
      } else if (creatorRole.role_name === "super-admin") {
        client_id = req.user.id;
      } else {
        client_id = req.user.client_id;
      }

      const otp = generateOTP(OTP_CONFIG.LENGTH);

      const hashedPassword = await bcrypt.hash(password, 12);

      const tempUser = {
        id: req.user.id,
        username,
        email,
        role_id: role.id,
        password: hashedPassword,
        verificationOTP: otp,
        verificationOTPExpiry: Date.now() + OTP_CONFIG.EXPIRY.DEFAULT,
        client_id: client_id,
        created_by: req.user?.username,
      };

      const verificationToken = jwt.sign(
        {
          ...tempUser,
          type: 'signup_verification'
        },
        JWT_SECRET,
        { expiresIn: '15m' }
      );

      const emailTemplate = getVerificationEmailTemplate(username, otp);

      await sendEmail(req.user.email, 'Verify Your Email', emailTemplate);

      // await sgMail.send({
      //     to: req.user.email,
      //     from: EMAIL_FROM,
      //     subject: 'Verify Your Email',
      //     html: emailTemplate
      // });

      return responseHandler.success(res, "OTP sent to email", {
        verificationToken
      });
    } catch (error) {
      return responseHandler.error(res, error?.message);
    }
  }
};
