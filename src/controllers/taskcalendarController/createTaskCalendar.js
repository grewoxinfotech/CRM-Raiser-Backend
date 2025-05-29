import Joi from "joi";
import TaskCalendar from "../../models/taskcalendarModel.js";
import Notification from "../../models/notificationModel.js";
import responseHandler from "../../utils/responseHandler.js";
import validator from "../../utils/validator.js";
import dayjs from "dayjs";

export default {
  validator: validator({
    body: Joi.object({
      taskName: Joi.string().required(),
      section: Joi.string().required(),
      taskType: Joi.string().required(),
      taskDate: Joi.date().required(),
      taskTime: Joi.string().required(),
      taskDescription: Joi.string().required(),
    }),
  }),
  handler: async (req, res) => {
    try {
      const { taskName, taskDate, taskTime, section, taskDescription, taskType } =
        req.body;

      const existingTask = await TaskCalendar.findOne({
        where: { taskName, taskDate, taskTime, taskDescription },
      });
      if (existingTask) {
        return responseHandler.error(res, "Task already exists");
      }

      // Create the task calendar entry
      const task = await TaskCalendar.create({
        taskName,
        taskDate,
        taskTime,
        taskDescription,
        taskType,
        client_id: req.des?.client_id,
        created_by: req.user?.username,
      });

      // Parse task time to calculate reminder time
      const [hours, minutes] = taskTime.split(":").map(Number);
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

      // 1. Create notification for task start time
      await Notification.create({
        related_id: task.id,
        users: [req.user?.id],
        title: "Task Calendar Event",
        notification_type: "reminder",
        from: req.user?.id,
        client_id: req.des?.client_id,
        date: dayjs(taskDate).format("YYYY-MM-DD"),
        section: section,
        parent_id: req.user?.id,
        time: taskTime,
        message: `Task starting: ${taskName}`,
        description: `📅 Task Details:
• Name: ${taskName}
• Time: ${taskTime}
• Description: ${taskDescription}`,
        created_by: req.user?.username,
      });

      // 2. Create reminder notification (2 minutes before)
      await Notification.create({
        related_id: task.id,
        users: [req.user?.id],
        title: "Task Starting Soon",
        notification_type: "reminder",
        from: req.user?.id,
        client_id: req.des?.client_id,
        date: dayjs(taskDate).format("YYYY-MM-DD"),
        time: reminderTime,
        section: section,
        parent_id: req.user?.id,
        message: `Task starting in 2 minutes: ${taskName}`,
        description: `⏰ Upcoming Task:
• Name: ${taskName}
• Starts in: 2 minutes
• Start Time: ${taskTime}
• Description: ${taskDescription}`,
        created_by: req.user?.username,
      });

      return responseHandler.success(res, "Task created successfully", task);
    } catch (error) {
      console.error("Task Calendar Creation Error:", error);
      return responseHandler.error(res, error?.message);
    }
  },
};
