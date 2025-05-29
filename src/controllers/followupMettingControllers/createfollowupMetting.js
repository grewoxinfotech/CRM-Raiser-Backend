import FollowupMetting from "../../models/followupMettingModel.js";
import responseHandler from "../../utils/responseHandler.js";
import Joi from "joi";
import validator from "../../utils/validator.js";
import Notification from "../../models/notificationModel.js";
import dayjs from "dayjs";

// Helper function to get reminder time before meeting
const getParticipantReminderTime = (meetingTime, reminderType) => {
  const [hours, minutes, seconds] = meetingTime.split(":").map(Number);
  const meetingDate = new Date();
  meetingDate.setHours(hours, minutes, seconds);

  switch (reminderType) {
    case "5_min":
      meetingDate.setMinutes(meetingDate.getMinutes() - 5);
      break;
    case "10_min":
      meetingDate.setMinutes(meetingDate.getMinutes() - 10);
      break;
    case "15_min":
      meetingDate.setMinutes(meetingDate.getMinutes() - 15);
      break;
    case "30_min":
      meetingDate.setMinutes(meetingDate.getMinutes() - 30);
      break;
    case "1_hour":
      meetingDate.setHours(meetingDate.getHours() - 1);
      break;
    default:
      return meetingTime;
  }

  return meetingDate.toTimeString().split(" ")[0];
};

// Helper function to generate dates for repeated meetings
const generateRepeatDates = (repeat, startDate) => {
  const dates = [];
  const start = dayjs(repeat?.repeat_start_date || startDate);

  // Number of occurrences based on repeat_times or until end_date
  const repeatTimes =
    repeat.repeat_end_type === "after" ? parseInt(repeat.repeat_times) : null;
  const endDate =
    repeat.repeat_end_type === "on" ? dayjs(repeat.repeat_end_date) : null;

  let currentDate = start;
  let count = 0;

  while (true) {
    // Break conditions
    if (repeatTimes && count >= repeatTimes) break;
    if (endDate && currentDate.isAfter(endDate)) break;
    if (count > 100) break; // Safety limit

    dates.push(currentDate.format("YYYY-MM-DD"));

    // Calculate next date based on repeat_type
    switch (repeat.repeat_type) {
      case "daily":
        currentDate = currentDate.add(1, "day");
        break;
      case "weekly":
        currentDate = currentDate.add(1, "week");
        break;
      case "monthly":
        currentDate = currentDate.add(1, "month");
        break;
      case "yearly":
        currentDate = currentDate.add(1, "year");
        break;
      case "custom":
        if (repeat.custom_repeat_frequency === "daily") {
          currentDate = currentDate.add(repeat.custom_repeat_interval, "day");
        } else if (repeat.custom_repeat_frequency === "weekly") {
          currentDate = currentDate.add(repeat.custom_repeat_interval, "week");
        } else if (repeat.custom_repeat_frequency === "monthly") {
          currentDate = currentDate.add(repeat.custom_repeat_interval, "month");
        }
        break;
    }
    count++;
  }

  return dates;
};

export default {
  validator: validator({
    params: Joi.object({
      id: Joi.string().required(),
    }),
    body: Joi.object({
      title: Joi.string().required(),
      section: Joi.string().required(),
      meeting_type: Joi.string().valid("offline", "online").required(),
      venue: Joi.string().optional().allow(null),
      location: Joi.string().optional().allow(null),
      meeting_link: Joi.string().optional().allow(null),
      from_date: Joi.string().required(),
      from_time: Joi.string().required(),
      to_date: Joi.string().required(),
      to_time: Joi.string().optional(),
      meeting_status: Joi.string().required(),
      assigned_to: Joi.object({
        assigned_to: Joi.array().items(Joi.string()).required(),
      }).required(),
      reminder: Joi.object().allow(null),
      repeat: Joi.object().allow(null),
      participants_reminder: Joi.string().optional().allow(null),
      priority: Joi.string()
        .valid("highest", "high", "medium", "low")
        .required(),
    }),
  }),

  handler: async (req, res) => {
    try {
      const { id } = req.params;
      const meetingData = req.body;

      // Create the meeting
      const meeting = await FollowupMetting.create({
        ...meetingData,
        client_id: req.des?.client_id,
        host: req.user?.id,
        related_id: id,
        created_by: req.user?.username,
      });

      // Generate repeat dates if repeat is configured
      const repeatDates = meetingData.repeat
        ? generateRepeatDates(
            meetingData.repeat,
            meetingData.repeat.repeat_start_date
          )
        : [meetingData.from_date];

      // Create notifications for each assigned user
      for (const assignedUser of meetingData.assigned_to.assigned_to) {
        // 1. Create meeting assignment notification
        await Notification.create({
          related_id: meeting.id,
          users: [assignedUser],
          title: "New Meeting Assignment",
          from: req.user?.id,
          client_id: req.des?.client_id,
          priority: meetingData.priority,
          section: meetingData.section,
          parent_id: id.replace(/^(lead_|deal_)/, ""),
          message: `You have been assigned to a new meeting: ${meetingData.title}`,
          description: `📅 Meeting Details:
• Title: ${meetingData.title}
• Type: ${meetingData.meeting_type}
• Priority: ${meetingData.priority}
${meetingData.venue ? `• Venue: ${meetingData.venue}` : ""}
${meetingData.location ? `• Location: ${meetingData.location}` : ""}
${meetingData.meeting_link ? `• Meeting Link: ${meetingData.meeting_link}` : ""}
• From: ${meetingData.from_date} ${meetingData.from_time}
• To: ${meetingData.to_date} ${meetingData.to_time}
${
  meetingData.repeat
    ? `• Repeats: ${meetingData.repeat.repeat_type} (${repeatDates.length} occurrences)`
    : ""
}`,
          created_by: req.user?.username,
        });

        // 2. Create reminder notifications for each repeat date
        if (meetingData.reminder || meetingData.repeat) {
          // Create a notification for each repeat date
          for (const date of repeatDates) {
            await Notification.create({
              related_id: meeting.id,
              users: [assignedUser],
              title: "Meeting Reminder",
              notification_type: "reminder",
              from: req.user?.id,
              client_id: req.des?.client_id,
              date: date,
              time:
                meetingData.repeat?.repeat_start_time ||
                meetingData.reminder?.reminder_time ||
                meetingData.from_time,
              priority: meetingData.priority,
              message: `Meeting Reminder: ${meetingData.title}`,
              section: meetingData.section,
              parent_id: id.replace(/^(lead_|deal_)/, ""),
              description: `⏰ Meeting Details:
• Title: ${meetingData.title}
• Type: ${meetingData.meeting_type}
• Priority: ${meetingData.priority}
${meetingData.venue ? `• Venue: ${meetingData.venue}` : ""}
${meetingData.location ? `• Location: ${meetingData.location}` : ""}
${meetingData.meeting_link ? `• Meeting Link: ${meetingData.meeting_link}` : ""}
• Date: ${date}
• Time: ${meetingData.from_time} - ${meetingData.to_time}
${
  meetingData.repeat ? `• Repeat Type: ${meetingData.repeat.repeat_type}` : ""
}`,
              created_by: req.user?.username,
              is_repeat: meetingData.repeat ? true : false,
            });
          }
        }

        // 3. Create participants reminder notification if configured
        if (meetingData.participants_reminder) {
          const reminderTime = getParticipantReminderTime(
            meetingData.from_time,
            meetingData.participants_reminder
          );

          // Create a notification for each repeat date with participant reminder
          for (const date of repeatDates) {
            await Notification.create({
              related_id: meeting.id,
              users: [assignedUser],
              title: "Meeting Starting Soon",
              notification_type: "reminder",
              from: req.user?.id,
              client_id: req.des?.client_id,
              date: date,
              time: reminderTime,
              priority: meetingData.priority,
              message: `Meeting starting in ${meetingData.participants_reminder.replace(
                "_",
                " "
              )}: ${meetingData.title}`,
              section: meetingData.section,
              parent_id: id.replace(/^(lead_|deal_)/, ""),
              description: `🔔 Meeting Starting Soon:
• Title: ${meetingData.title}
• Type: ${meetingData.meeting_type}
• Priority: ${meetingData.priority}
${meetingData.venue ? `• Venue: ${meetingData.venue}` : ""}
${meetingData.location ? `• Location: ${meetingData.location}` : ""}
${meetingData.meeting_link ? `• Meeting Link: ${meetingData.meeting_link}` : ""}
• Starts at: ${meetingData.from_time}
• Date: ${date}`,
              created_by: req.user?.username,
              is_repeat: meetingData.repeat ? true : false,
            });
          }
        }
      }

      return responseHandler.success(
        res,
        "Meeting created successfully!",
        meeting
      );
    } catch (error) {
      console.error("Error creating meeting:", error);
      return responseHandler.error(res, error?.message);
    }
  },
};
