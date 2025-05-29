import Joi from "joi";
import TaskCalendar from "../../models/taskcalendarModel.js";
import Notification from "../../models/notificationModel.js";
import responseHandler from "../../utils/responseHandler.js";
import validator from "../../utils/validator.js";
import { Op } from "sequelize";
import dayjs from "dayjs";

export default {
  validator: validator({
    body: Joi.object({
      taskName: Joi.string().required(),
      taskDate: Joi.date().required(),
      taskTime: Joi.string().required(),
      taskDescription: Joi.string().required(),
      taskType: Joi.string().required(),
    }),
    params: Joi.object({
      id: Joi.string().required(),
    }),
  }),
  handler: async (req, res) => {
    try {
      const { id } = req.params;
      const { taskName, taskDate, taskTime, taskDescription, taskType } = req.body;
      const task = await TaskCalendar.findByPk(id);
      if (!task) {
        return responseHandler.error(res, "Task not found");
      }
      const existingTask = await TaskCalendar.findOne({
        where: {
          taskName,
          taskDate,
          taskTime,
          taskDescription,
          taskType,
          id: { [Op.not]: id },
        },
      });
      if (existingTask) {
        return responseHandler.error(res, "Task already exists");
      }
      await task.update({
        taskName,
        taskDate,
        taskTime,
        taskDescription,
        taskType,
        updated_by: req.user?.username,
      });

      // Delete existing notifications for this task
      await Notification.destroy({
        where: {
          related_id: id,
        },
      });

      // Create task update notification
      await Notification.create({
        related_id: id,
        users: [req.user?.id],
        title: "Task Calendar Event Updated",
        from: req.user?.id,
        client_id: req.des?.client_id,
        message: `Task updated: ${taskName}`,
        priority: "medium",
        section: "task_calendar",
        parent_id: task.related_id,
        description: `📅 Updated Task Details:
• Name: ${taskName}
• Date: ${dayjs(taskDate).format("YYYY-MM-DD")}
• Time: ${taskTime}
• Description: ${taskDescription}`,
        created_by: req.user?.username,
      });

      // Create reminder notification
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

      await Notification.create({
        related_id: id,
        users: [req.user?.id],
        title: "Task Starting Soon",
        notification_type: "reminder",
        from: req.user?.id,
        client_id: req.des?.client_id,
        date: dayjs(taskDate).format("YYYY-MM-DD"),
        time: reminderTime,
        message: `Task starting in 2 minutes: ${taskName}`,
        priority: "medium",
        section: "task_calendar",
        parent_id: task.related_id,
        description: `⏰ Upcoming Task:
• Name: ${taskName}
• Starts in: 2 minutes
• Start Time: ${taskTime}
• Description: ${taskDescription}`,
        created_by: req.user?.username,
        is_repeat: false,
      });

      return responseHandler.success(res, "Task updated successfully", task);
    } catch (error) {
      return responseHandler.error(res, error?.message);
    }
  },
};
