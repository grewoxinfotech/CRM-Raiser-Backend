import Joi from "joi";
import validator from "../../utils/validator.js";
import Announcement from "../../models/announcementModel.js";
import Notification from "../../models/notificationModel.js";
import responseHandler from "../../utils/responseHandler.js";
import dayjs from "dayjs";

export default {
  validator: validator({
    body: Joi.object({
      title: Joi.string().required(),
      time: Joi.string().required(),
      date: Joi.string().required(),
      description: Joi.string().required(),
      branch: Joi.object({
        branch: Joi.array().items(Joi.string()),
      })
        .optional()
        .allow("", null),
    }),
  }),
  handler: async (req, res) => {
    try {
      const { title, description, branch, time, date } = req.body;

      const announcement = await Announcement.create({
        title,
        description,
        branch,
        time,
        date,
        client_id: req.des?.client_id,
        created_by: req.user.username,
      });

      // Calculate reminder time (2 minutes before)
      const [hours, minutes] = time.split(":").map(Number);
      let reminderHours = hours;
      let reminderMinutes = minutes - 2;

      // Handle minute rollover
      if (reminderMinutes < 0) {
        reminderHours = hours - 1;
        reminderMinutes = 58; // 60 - 2

        // Handle hour rollover
        if (reminderHours < 0) {
          reminderHours = 23;
        }
      }

      // Format reminder time with padding
      const reminderTime = `${String(reminderHours).padStart(2, "0")}:${String(
        reminderMinutes
      ).padStart(2, "0")}:00`;

      // Get users array from branch
      const users = branch?.branch || [];

      // 1. Create announcement notification
      await Notification.create({
        related_id: announcement.id,
        users: users,
        title: "New Announcement",
        from: req.user?.id,
        client_id: req.des?.client_id,
        section: "announcement",
        parent_id: req.user?.id,
        message: `New announcement from ${req.user.username}: ${title}`,
        description: `📢 Announcement Details:
• Title: ${title}
• Date: ${dayjs(date).format("YYYY-MM-DD")}
• Time: ${time}
${description ? `\nDescription: ${description}` : ""}`,
        created_by: req.user.username,
      });

      // 2. Create notification for announcement time
      await Notification.create({
        related_id: announcement.id,
        users: users,
        title: "Announcement Time",
        notification_type: "reminder",
        from: req.user?.id,
        client_id: req.des?.client_id,
        date: dayjs(date).format("YYYY-MM-DD"),
        section: "announcement",
        parent_id: req.user?.id,
        time: time,
        message: `Announcement time: ${title}`,
        description: `📢 Announcement Details:
• Title: ${title}
• Time: ${time}
${description ? `\nDescription: ${description}` : ""}`,
        created_by: req.user.username,
      });

      // 3. Create reminder notification (2 minutes before)
      await Notification.create({
        related_id: announcement.id,
        users: users,
        title: "Announcement Starting Soon",
        notification_type: "reminder",
        from: req.user?.id,
        client_id: req.des?.client_id,
        date: dayjs(date).format("YYYY-MM-DD"),
        section: "announcement",
        parent_id: req.user?.id,
        time: reminderTime,
        message: `Announcement in 2 minutes: ${title}`,
        description: `⏰ Upcoming Announcement:
• Title: ${title}
• Starts in: 2 minutes
• Time: ${time}
${description ? `\nDescription: ${description}` : ""}`,
        created_by: req.user.username,
      });

      //   console.log("Announcement Notifications Created:", {
      //     title,
      //     date: dayjs(date).format("YYYY-MM-DD"),
      //     time,
      //     reminderTime,
      //     notificationCount: 3,
      //   });

      return responseHandler.success(
        res,
        "Announcement created successfully",
        announcement
      );
    } catch (error) {
      console.error("Announcement Creation Error:", error);
      return responseHandler.error(res, error?.message);
    }
  },
};
