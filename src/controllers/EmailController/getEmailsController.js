import Email from "../../models/emailModel.js";
import Role from "../../models/roleModel.js";
import User from "../../models/userModel.js";
import responseHandler from "../../utils/responseHandler.js";
import validator from "../../utils/validator.js";
import Joi from "joi";
import { Op } from "sequelize";
import nodemailer from "nodemailer";
import EmailSettings from "../../models/emailSettingModel.js";
import dayjs from "dayjs";

// Separate function to handle scheduled emails
export const handleScheduledEmails = async () => {
  try {
    console.log("🔍 Starting scheduled email check...");

    // Get all scheduled emails
    const scheduledEmails = await Email.findAll({
      where: {
        type: "scheduled",
      },
    });

    // console.log(`📧 Found ${scheduledEmails.length} scheduled emails`);

    const currentDate = dayjs().format("YYYY-MM-DD");
    const currentTime = dayjs().format("HH:mm:ss");
    // console.log(`⏰ Current DateTime: ${currentDate} ${currentTime}`);

    // Find emails that need to be sent
    const emailsToSend = scheduledEmails.filter((email) => {
      const shouldSend =
        email.scheduleDate === currentDate
          ? email.scheduleTime <= currentTime
          : email.scheduleDate < currentDate;

      return shouldSend;
    });

    // console.log(`✉️ Found ${emailsToSend.length} emails ready to send`);

    // Send due emails
    if (emailsToSend.length > 0) {
      for (const email of emailsToSend) {
        try {
          // console.log(`\n🚀 Processing email ID: ${email.id}`);

          // Get email settings for this client
          // console.log(
          //   `👤 Fetching email settings for client ID: ${email.client_id}`
          // );
          const emailSettings = await EmailSettings.findOne({
            where: {
              client_id: email.client_id,
              is_active: true,
            },
          });

          // Set email credentials
          const emailUser = emailSettings?.email || process.env.SMTP_USER;
          // console.log(`📧 Using email address: ${emailUser}`);

          // Create transporter
          const transporter = nodemailer.createTransport({
            service: "gmail",
            auth: {
              user: emailUser,
              pass: emailSettings?.app_password || process.env.SMTP_PASS,
            },
          });

          // Safely parse attachments
          let attachments = [];
          try {
            if (email.attachments) {
              const parsedAttachments = JSON.parse(email.attachments);
              if (Array.isArray(parsedAttachments)) {
                attachments = parsedAttachments.map((attachment) => ({
                  filename: attachment.filename || "attachment",
                  content: attachment.content || "",
                  contentType:
                    attachment.contentType || "application/octet-stream",
                  encoding: "base64",
                }));
              }
            }
          } catch (attachmentError) {
            console.warn(
              `⚠️ Error parsing attachments for email ${email.id}:`,
              attachmentError
            );
          }

          const mailOptions = {
            from: `"${email.created_by || "System"}" <${emailUser}>`,
            to: email.to,
            subject: email.subject,
            html: email.html || "",
            attachments: attachments,
          };

          // console.log(`📤 Attempting to send email to: ${email.to}`);
          if (attachments.length > 0) {
            // console.log(`📎 Sending with ${attachments.length} attachments`);
          }

          await transporter.sendMail(mailOptions);

          // Update email status to sent
          // console.log(`✏️ Updating email status to sent`);
          await email.update({
            status: "sent",
            type: "sent",
          });

          // console.log(`✅ Email ${email.id} sent successfully`);
        } catch (error) {
          // console.error(`❌ Failed to send email ${email.id}:`, error);
          // console.log(`✏️ Updating email status to failed`);
          await email.update({
            status: "failed",
            error_message: error.message,
          });
        }
      }
    } else {
      // console.log("💤 No emails need to be sent at this time");
    }

    // console.log("✨ Scheduled email check completed\n");
  } catch (error) {
    console.error("❌ Error handling scheduled emails:", error);
    throw error;
  }
};

export default {
  validator: validator({
    query: Joi.object({
      type: Joi.string()
        .valid("inbox", "sent", "trash", "starred", "important", "scheduled")
        .optional(),
    }),
  }),

  handler: async (req, res) => {
    try {
      const userRole = req.user.role;
      let whereClause = {};

      const role = await Role.findOne({ where: { id: userRole } });
      if (!role) {
        return responseHandler.error(res, "Role not found");
      }

      let emails;
      let clientId;
      if (role.role_name === "client") {
        clientId = req.user.id;
        emails = await Email.findAll({
          where: {
            client_id: clientId,
          },
          order: [["createdAt", "DESC"]],
        });
      } else {
        const user = await User.findOne({ where: { id: req.user.id } });
        if (!user) {
          return responseHandler.error(res, "User not found");
        }
        clientId = user.client_id;
        emails = await Email.findAll({
          where: {
            client_id: clientId,
          },
          order: [["createdAt", "DESC"]],
        });
      }

      // Filter emails based on their type
      const filteredEmails = emails.filter((email) => {
        const type = email.type;

        if (type === "inbox" || !type) {
          return !email.isTrash;
        } else if (type === "sent") {
          return type === "sent";
        } else if (type === "starred") {
          return email.isStarred && !email.isTrash;
        } else if (type === "important") {
          return email.isImportant && !email.isTrash;
        } else if (type === "scheduled") {
          return type === "scheduled";
        } else if (type === "trash") {
          return email.isTrash;
        }
        return false;
      });

      // Handle scheduled emails if any are found
      const scheduledEmails = filteredEmails.filter(
        (email) => email.type === "scheduled"
      );
      if (scheduledEmails.length > 0) {
        console.log("🔍 Starting scheduled email check...");
        await handleScheduledEmails();

        // Refresh emails list after sending scheduled emails
        const updatedEmails = await Email.findAll({
          where: {
            client_id: clientId,
          },
          order: [["createdAt", "DESC"]],
        });

        // Apply the same filtering to updated emails
        const updatedFilteredEmails = updatedEmails.filter((email) => {
          const type = email.type;

          if (type === "inbox" || !type) {
            return !email.isTrash;
          } else if (type === "sent") {
            return type === "sent";
          } else if (type === "starred") {
            return email.isStarred && !email.isTrash;
          } else if (type === "important") {
            return email.isImportant && !email.isTrash;
          } else if (type === "scheduled") {
            return type === "scheduled";
          } else if (type === "trash") {
            return email.isTrash;
          }
          return false;
        });

        return responseHandler.success(
          res,
          "Emails fetched successfully",
          updatedFilteredEmails
        );
      }

      return responseHandler.success(
        res,
        "Emails fetched successfully",
        filteredEmails
      );
    } catch (error) {
      console.error("Get emails error:", error);
      return responseHandler.error(
        res,
        error?.message || "An error occurred while fetching emails"
      );
    }
  },
};
