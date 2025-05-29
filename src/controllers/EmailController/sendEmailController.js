import Email from "../../models/emailModel.js";
import EmailSettings from "../../models/emailSettingModel.js";
import responseHandler from "../../utils/responseHandler.js";
import Joi from "joi";
import validator from "../../utils/validator.js";
import nodemailer from "nodemailer";
import uploadToS3 from "../../utils/uploadToS3.js";

export default {
  validator: validator({
    body: Joi.object({
      to: Joi.string().email().required(),
      subject: Joi.string().required(),
      html: Joi.string().optional(),
      type: Joi.string().valid("inbox", "sent", "trash").default("sent"),
      isRead: Joi.boolean().default(false),
      isStarred: Joi.boolean().default(false),
      isImportant: Joi.boolean().default(false),
      scheduleDate: Joi.date().optional().allow(null),
      scheduleTime: Joi.string().optional().allow(null),
    }),
  }),

  handler: async (req, res) => {
    try {
      const {
        to,
        subject,
        html,
        type,
        isRead,
        isStarred,
        isImportant,
        scheduleDate,
        scheduleTime,
      } = req.body;

      // Handle file uploads to S3
      let attachments = [];
      if (req.files && req.files.length > 0) {
        console.log("Processing files:", req.files.length);

        for (const file of req.files) {
          try {
            console.log("Uploading file:", file.originalname);
            const s3Url = await uploadToS3(
              file,
              req.user?.username,
              "email-attachments"
            );
            attachments.push({
              name: file.originalname,
              size: file.size,
              url: s3Url,
            });
            console.log("File uploaded successfully:", s3Url);
          } catch (error) {
            console.error(
              "S3 upload error for file:",
              file.originalname,
              error
            );
          }
        }
      }

      // Find email settings
      const emailSettings = await EmailSettings.findOne({
        where: {
          client_id: req.des?.client_id,
          is_active: true,
        },
      });

      // Set email credentials
      let emailUser = emailSettings?.email || process.env.SMTP_USER;
      let emailPass = emailSettings?.app_password || process.env.SMTP_PASS;

      // Create transporter
      const transporter = nodemailer.createTransport({
        service: "gmail",
        auth: {
          user: emailUser,
          pass: emailPass,
        },
      });

      // Prepare email data
      const mailOptions = {
        from: `"${req.user?.username || "System"}" <${emailUser}>`,
        to: to,
        subject: subject,
        html: html || "",
        attachments: attachments,
      };

      console.log("Mail options:", {
        to: mailOptions.to,
        subject: mailOptions.subject,
        attachmentsCount: mailOptions.attachments.length,
      });

      const status = scheduleDate && scheduleTime ? "scheduled" : "sent";

      // Create email record
      const email = await Email.create({
        to,
        subject,
        from: emailUser,
        html: html || "",
        attachments: JSON.stringify(attachments),
        type,
        isRead,
        isStarred,
        isImportant,
        scheduleDate,
        scheduleTime,
        status,
        client_id: req.des?.client_id,
        created_by: req.user?.username,
      });

      // If scheduled, don't send now
      if (scheduleDate && scheduleTime) {
        return responseHandler.success(
          res,
          "Email scheduled successfully",
          email
        );
      }

      // Send email
      try {
        await transporter.sendMail(mailOptions);
        await email.update({ status: "sent" });
        return responseHandler.success(res, "Email sent successfully", email);
      } catch (error) {
        await email.update({ status: "failed" });
        console.error("Send email error:", error);
        return responseHandler.error(
          res,
          "Failed to send email: " + error.message
        );
      }
    } catch (error) {
      console.error("Controller error:", error);
      return responseHandler.error(res, error?.message || "An error occurred");
    }
  },
};
