import FollowupCall from "../../models/followupCallModel.js";
import responseHandler from "../../utils/responseHandler.js";
import Joi from "joi";
import validator from "../../utils/validator.js";
import Notification from "../../models/notificationModel.js";

// Helper function to get reminder time before call
const getCallReminderTime = (callTime, reminderType) => {
  const [hours, minutes, seconds] = callTime.split(":").map(Number);
  const callDate = new Date();
  callDate.setHours(hours, minutes, seconds);

  switch (reminderType) {
    case "5_min":
      callDate.setMinutes(callDate.getMinutes() - 5);
      break;
    case "10_min":
      callDate.setMinutes(callDate.getMinutes() - 10);
      break;
    case "15_min":
      callDate.setMinutes(callDate.getMinutes() - 15);
      break;
    case "30_min":
      callDate.setMinutes(callDate.getMinutes() - 30);
      break;
    case "1_hour":
      callDate.setHours(callDate.getHours() - 1);
      break;
    default:
      return callTime;
  }

  return callDate.toTimeString().split(" ")[0];
};

export default {
  validator: validator({
    params: Joi.object({
      id: Joi.string().required(),
    }),
    body: Joi.object({
      subject: Joi.string().optional().allow(null),
      section: Joi.string().optional().allow(null),
      call_start_date: Joi.string().optional().allow(null),
      call_duration: Joi.string().optional().allow(null),
      call_start_time: Joi.string().optional().allow(null),
      call_end_time: Joi.string().optional().allow(null),
      call_reminder: Joi.string().optional().allow(null),
      assigned_to: Joi.object({
        assigned_to: Joi.array().items(Joi.string()).optional().allow(null),
      })
        .optional()
        .allow(null),
      call_purpose: Joi.string().optional().allow(null),
      call_notes: Joi.string().optional().allow(null),
      call_type: Joi.string().optional().allow(null),
      call_status: Joi.string().optional().allow(null),
      priority: Joi.string()
        .valid("highest", "high", "medium", "low")
        .optional()
        .allow(null),
    }),
  }),

  handler: async (req, res) => {
    try {
      const { id } = req.params;
      const callData = req.body;

      // Find existing call
      const existingCall = await FollowupCall.findByPk(id);
      if (!existingCall) {
        return responseHandler.error(res, "Call not found");
      }

      // Delete existing notifications
      await Notification.destroy({
        where: { related_id: id },
      });

      // Update the call
      await FollowupCall.update(
        {
          ...callData,
          updated_by: req.user?.username,
          updated_at: new Date(),
        },
        {
          where: { id },
        }
      );

      // Create new notifications for each assigned user
      for (const assignedUser of callData.assigned_to.assigned_to) {
        // 1. Create call assignment notification
        await Notification.create({
          related_id: id,
          users: [assignedUser],
          title: "Call Updated",
          from: req.user?.id,
          client_id: req.des?.client_id,
          message: `Call details have been updated: ${callData.subject}`,
          priority: callData.priority,
          section: callData.section,
          parent_id: existingCall.related_id,
          description: `📞 Updated Call Details:
• Subject: ${callData.subject}
• Date: ${callData.call_start_date}
• Time: ${callData.call_start_time}
• Purpose: ${callData.call_purpose || "N/A"}
• Type: ${callData.call_type}
• Priority: ${callData.priority}
• Status: ${callData.call_status}
${callData.call_notes ? `\nNotes: ${callData.call_notes}` : ""}`,
          created_by: req.user?.username,
        });

        // 2. Create reminder notification if call_reminder is set
        if (callData.call_reminder) {
          const reminderTime = getCallReminderTime(
            callData.call_start_time,
            callData.call_reminder
          );

          await Notification.create({
            related_id: id,
            users: [assignedUser],
            title: "Call Starting Soon",
            notification_type: "reminder",
            from: req.user?.id,
            client_id: req.des?.client_id,
            date: callData.call_start_date,
            time: reminderTime,
            priority: callData.priority,
            section: callData.section,
            parent_id: existingCall.related_id,
            message: `Call starting in ${callData.call_reminder.replace(
              "_",
              " "
            )}: ${callData.subject}`,
            description: `🔔 Upcoming Call:
• Subject: ${callData.subject}
• Starting at: ${callData.call_start_time}
• Date: ${callData.call_start_date}
• Purpose: ${callData.call_purpose || "N/A"}
• Type: ${callData.call_type}
• Priority: ${callData.priority}
${callData.call_notes ? `\nNotes: ${callData.call_notes}` : ""}`,
            created_by: req.user?.username,
          });
        }
      }

      return responseHandler.success(
        res,
        "Call updated successfully!",
        callData
      );
    } catch (error) {
      console.error("Error updating call:", error);
      return responseHandler.error(res, error?.message);
    }
  },
};
