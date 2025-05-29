import Joi from "joi";
import bcrypt from "bcrypt";
import validator from "../../utils/validator.js";
import responseHandler from "../../utils/responseHandler.js";
import Role from "../../models/roleModel.js";
import generateId from "../../middlewares/generatorId.js";
import User from "../../models/userModel.js";
import sgMail, { sendEmail } from "../../utils/emailService.js";
import { generateOTP } from "../../utils/otpService.js";
import { OTP_CONFIG, EMAIL_FROM } from "../../config/config.js";
import jwt from "jsonwebtoken";
import { JWT_SECRET } from "../../config/config.js";
import { getVerificationEmailTemplate } from "../../utils/emailTemplates.js";
import uploadToS3 from "../../utils/uploadToS3.js";

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
          "string.base": "Password must be a string",
          "string.empty": "Password is required",
          "string.min": "Password must be at least 8 characters",
          "string.pattern.base":
            "Password must contain only letters, numbers and special characters",
        }),
      firstName: Joi.string().allow("", null),
      lastName: Joi.string().allow("", null),
      phoneCode: Joi.string().optional().allow("", null),
      currency: Joi.string().optional().allow("", null),
      phone: Joi.string().allow("", null),
      address: Joi.string().allow("", null),
      gender: Joi.string().allow("", null),
      joiningDate: Joi.date().allow("", null),
      leaveDate: Joi.date().allow(null),
      branch: Joi.string().allow("", null),
      department: Joi.string().allow("", null),
      designation: Joi.string().allow("", null),
      salary: Joi.number().allow("", null),
      accountholder: Joi.string().allow("", null),
      accountnumber: Joi.number().allow("", null),
      bankname: Joi.string().allow("", null),
      ifsc: Joi.string().allow("", null),
      banklocation: Joi.string().allow("", null),
      documents: Joi.object().optional().allow(null),
      links: Joi.object().optional().allow(null),
    }),
  }),
  handler: async (req, res) => {
    try {
      const profilePic = req.files?.profilePic?.[0];
      const e_signatures = req.files?.e_signatures?.[0];

      const { subscription } = req;
      const {
        username,
        email,
        password,
        phoneCode,
        currency,
        firstName,
        lastName,
        phone,
        address,
        gender,
        joiningDate,
        leaveDate,
        branch,
        department,
        designation,
        salary,
        accountholder,
        accountnumber,
        bankname,
        ifsc,
        banklocation,
        documents,
        links,
      } = req.body;

      // Check if email already exists
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

      // Check if phone number already exists
      const existingPhoneNumber = await User.findOne({
        where: { phone },
      });

      if (existingPhoneNumber) {
        return responseHandler.error(res, "Phone number already exists.");
      }

      // const [role] = await Role.findOrCreate({
      //     where: { role_name: 'employee', created_by: req.user?.username },
      //     defaults: { id: generateId() }
      // });

      const existingRole = await Role.findOne({
        where: {
          role_name: "employee",
          client_id: req.des.client_id,
          created_by: req.user.username,
        },
      });

      let role;
      if (!existingRole) {
        role = await Role.create({
          id: generateId(),
          role_name: "employee",
          client_id: req.des.client_id,
          created_by: req.user.username,
        });
      } else {
        role = existingRole;
      }

      // Generate OTP
      const otp = generateOTP(OTP_CONFIG.LENGTH);

      // Hash password
      const hashedPassword = await bcrypt.hash(password, 12);

      // Create temporary user record
      const tempUser = {
        id: req.user.id,
        username,
        email,
        role_id: role.id,
        password: hashedPassword,
        firstName,
        lastName,
        phoneCode,
        currency,
        phone,
        address,
        gender,
        joiningDate,
        leaveDate,
        branch,
        department,
        designation,
        salary,
        accountholder,
        accountnumber,
        bankname,
        ifsc,
        banklocation,
        profilePic,
        e_signatures,
        documents,
        links,
        verificationOTP: otp,
        client_id: req.des?.client_id,
        verificationOTPExpiry: Date.now() + OTP_CONFIG.EXPIRY.DEFAULT,
        created_by: req.user?.username,
      };
      // Store in session
      const verificationToken = jwt.sign(
        {
          ...tempUser,
          ...subscription,
          type: "signup_verification",
        },
        JWT_SECRET,
        { expiresIn: "15m" }
      );

      const emailTemplate = getVerificationEmailTemplate(username, otp);

      await sendEmail(req.user.email, "Verify Your Email", emailTemplate);

      // Send verification email
      // await sgMail.send({
      //     to: email,
      //     from: EMAIL_FROM,
      //     subject: 'Verify Your Email',
      //     html: emailTemplate
      // });

      return responseHandler.success(
        res,
        "Please verify your email to complete registration",
        { verificationToken }
      );
    } catch (error) {
      return responseHandler.error(res, error);
    }
  },
};
