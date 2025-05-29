import Joi from "joi";
import Task from "../../models/taskModel.js";
import responseHandler from "../../utils/responseHandler.js";
import validator from "../../utils/validator.js";
import Notification from "../../models/notificationModel.js";
import isSameDay from "../../utils/isSameDay.js";
import uploadToS3 from "../../utils/uploadToS3.js";
import dayjs from "dayjs";

export default {
  validator: validator({
    params: Joi.object({
      id: Joi.string().required(),
    }),
    body: Joi.object({
      taskName: Joi.string().optional().allow("", null),
      section: Joi.string().optional().allow("", null),
      startDate: Joi.date().optional().allow("", null),
      dueDate: Joi.date().optional().allow("", null),
      priority: Joi.string().optional().allow("", null),
      status: Joi.string().optional().allow("", null),
      assignTo: Joi.object().optional(),
      task_reporter: Joi.string().optional().allow("", null),
      reminder_date: Joi.date().optional().allow("", null),
      description: Joi.string().optional().allow("", null),
    }),
  }),
  handler: async (req, res) => {
    try {
      const { id } = req.params;

      const {
        taskName,
        section,
        task_reporter,
        startDate,
        dueDate,
        assignTo,
        description,
        priority,
        status,
        reminder_date,
      } = req.body;

      const existingTask = await Task.findOne({ where: { taskName } });
      if (existingTask) {
        return responseHandler.error(res, "Task already exists");
      }
      let fileUrl = null;
      if (req.file) {
        fileUrl = await uploadToS3(
          req.file,
          "client",
          "task_files",
          req.user?.username
        );
      }

      const task = await Task.create({
        related_id: id,
        taskName,
        task_reporter,
        startDate,
        dueDate,
        assignTo,
        description,
        priority,
        status,
        reminder_date,
        file: fileUrl,
        client_id: req.des?.client_id,
        created_by: req.user?.username,
      });

      const taskId = task.id;

      // Create task assignment notification for each assigned user
      for (const assignedUser of assignTo.assignedusers) {
        await Notification.create({
          related_id: taskId,
          users: [assignedUser],
          title: "New Task",
          from: req.user?.id,
          client_id: req.des?.client_id,
          section: section,
          parent_id: id,
          message: `${req.user?.username} assigned you a task: ${taskName}`,
          description: `Task Name: ${taskName}, start date: ${startDate}, due date: ${dueDate}`,
          created_by: req.user?.username,
        });

        // Create reminder notification if reminder_date is set
        if (reminder_date) {
          const reminderDate = dayjs(reminder_date);
          const reminderTime = "10:00:00"; // Set reminder for 10 AM
          const dueDateDiff = Math.ceil(
            (new Date(dueDate) - new Date(reminder_date)) /
            (1000 * 60 * 60 * 24)
          );

          await Notification.create({
            related_id: taskId,
            users: [assignedUser],
            title: "Task Reminder",
            notification_type: "reminder",
            from: req.user?.id,
            client_id: req.des?.client_id,
            date: reminderDate.format("YYYY-MM-DD"),
            section: section,
            parent_id: id,
            time: reminderTime,
            message: `Task due in ${dueDateDiff} days: ${taskName}`,
            description: `⏰ Task Details:
• Name: ${taskName}
• Due in: ${dueDateDiff} days
• Start Date: ${startDate}
• Due Date: ${dueDate}
• Priority: ${priority || "Not set"}
• Status: ${status || "Not started"}
${description ? `\nDescription: ${description}` : ""}`,
            created_by: req.user?.username,
          });
        }
      }

      return responseHandler.success(res, "Task created successfully", task);
    } catch (error) {
      return responseHandler.error(res, error?.message);
    }
  },
};
