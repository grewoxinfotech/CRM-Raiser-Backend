import Joi from "joi";
import Task from "../../models/taskModel.js";
import responseHandler from "../../utils/responseHandler.js";
import validator from "../../utils/validator.js";
import Notification from "../../models/notificationModel.js";
import isSameDay from "../../utils/isSameDay.js";
import { Op } from "sequelize";
import { s3 } from "../../config/config.js";
import uploadToS3 from "../../utils/uploadToS3.js";

export default {
  validator: validator({
    params: Joi.object({
      id: Joi.string().optional(),
    }),
    body: Joi.object({
      taskName: Joi.string().optional(),
      task_reporter: Joi.string().optional(),
      startDate: Joi.date().optional(),
      dueDate: Joi.date().optional(),
      assignTo: Joi.object().optional(),
      description: Joi.string().optional().allow("", null),
      priority: Joi.string().optional(),
      status: Joi.string().optional(),
      reminder_date: Joi.date().allow("", null),
    }),
  }),
  handler: async (req, res) => {
    try {
      const { id } = req.params;
      const file = req.file;

      const {
        taskName,
        task_reporter,
        startDate,
        dueDate,
        assignTo,
        priority,
        status,
        description,
        reminder_date,
      } = req.body;

      const task = await Task.findByPk(id);
      if (!task) {
        return responseHandler.error(res, "Task not found");
      }

      const existingTask = await Task.findOne({
        where: { taskName, id: { [Op.not]: id } },
      });
      if (existingTask) {
        return responseHandler.error(res, "Task already exists");
      }

      let fileUrl = task.file;
      if (file) {
        // Delete existing file from S3 if it exists
        if (task.file) {
          const key = decodeURIComponent(task.file.split(".com/").pop());
          const s3Params = {
            Bucket: s3.config.bucketName,
            Key: key,
          };
          await s3.deleteObject(s3Params).promise();
        }
        fileUrl = await uploadToS3(
          file,
          "client",
          "task_files",
          req.user?.username
        );
      }

      const updatedTask = await task.update({
        taskName,
        task_reporter,
        startDate,
        dueDate,
        assignTo,
        priority,
        status,
        description,
        reminder_date,
        file: fileUrl,
        updated_by: req.user?.username,
      });

      // Handle notifications based on assignTo changes
      if (assignTo) {
        // Get existing assigned users
        const existingAssignedUsers = task.assignTo?.assignedusers || [];
        const newAssignedUsers = assignTo.assignedusers || [];

        // Find removed users
        const removedUsers = existingAssignedUsers.filter(
          (user) => !newAssignedUsers.includes(user)
        );

        // Delete notifications for removed users
        if (removedUsers.length > 0) {
          await Notification.destroy({
            where: {
              related_id: id,
              users: removedUsers,
            },
          });
        }

        // Update existing notification
        const existingNotification = await Notification.findOne({
          where: { related_id: id },
        });

        if (existingNotification) {
          await existingNotification.update({
            users: assignTo.assignedusers,
            title: "Task Updated",
            message: `${req.user?.username} updated the task: ${taskName}`,
            description: `Task Name: ${taskName}, start date: ${startDate}, due date: ${dueDate}`,
            updated_by: req.user?.username,
            client_id: req.des?.client_id,
          });
        } else {
          // Create new notification if none exists
          await Notification.create({
            related_id: id,
            users: assignTo.assignedusers,
            title: "Task Updated",
            message: `${req.user?.username} updated the task: ${taskName}`,
            section: section,

            description: `Task Name: ${taskName}, start date: ${startDate}, due date: ${dueDate}`,
            from: req.user?.id,
            client_id: req.des?.client_id,
            created_by: req.user?.username,
          });
        }
      } else {
        // If assignTo is removed, delete all notifications
        await Notification.destroy({
          where: { related_id: id },
        });
      }

      if (reminder_date) {
        const reminderDate = new Date(reminder_date);
        const today = new Date();
        if (isSameDay(reminderDate, today)) {
          const dueDateDiff = Math.ceil(
            (new Date(dueDate) - reminderDate) / (1000 * 60 * 60 * 24)
          );

          // Update existing reminder notification instead of creating new one
          const existingReminderNotification = await Notification.findOne({
            where: {
              related_id: id,
              notification_type: "reminder",
            },
          });

          if (existingReminderNotification) {
            await existingReminderNotification.update({
              users: assignTo.assignedusers,
              title: "Task Reminder",
              notification_type: "reminder",
              from: req.user?.id,
              client_id: req.des?.client_id,
              message: `Task due: ${dueDateDiff} days. Don't forget: ${taskName}`,
              updated_by: req.user?.username,
            });
          }
        }
      }

      return responseHandler.success(
        res,
        "Task updated successfully",
        updatedTask
      );
    } catch (error) {
      return responseHandler.error(res, error?.message);
    }
  },
};
