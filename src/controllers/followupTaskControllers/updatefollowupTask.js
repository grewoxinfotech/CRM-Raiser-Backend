import FollowupTask from "../../models/followupTaskModel.js";
import responseHandler from "../../utils/responseHandler.js";
import Joi from "joi";
import validator from "../../utils/validator.js";
import Notification from "../../models/notificationModel.js";
import dayjs from "dayjs";

// Helper function to generate dates for repeated tasks
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
      subject: Joi.string().optional(),
      section: Joi.string().optional(),
      due_date: Joi.string().optional(),
      priority: Joi.string()
        .valid("highest", "high", "medium", "low")
        .optional(),
      task_reporter: Joi.string().optional().allow("", null),
      assigned_to: Joi.object({
        assigned_to: Joi.array().items(Joi.string()).optional(),
      }).optional(),
      status: Joi.string()
        .valid(
          "not_started",
          "in_progress",
          "completed",
          "on_hold",
          "cancelled"
        )
        .optional(),
      reminder: Joi.object().allow(null),
      repeat: Joi.object().allow(null),
      description: Joi.string().allow("", null),
    }),
  }),

  handler: async (req, res) => {
    try {
      const { id } = req.params;
      const {
        subject,
        section,
        due_date,
        priority,
        task_reporter,
        assigned_to,
        status,
        reminder,
        repeat,
        description,
      } = req.body;

      const followupTask = await FollowupTask.findByPk(id);
      if (!followupTask) {
        return responseHandler.error(res, "Followup task not found");
      }

      // Update the task
      await FollowupTask.update(
        {
          subject,
          section,
          due_date,
          priority,
          task_reporter,
          assigned_to,
          status,
          reminder,
          repeat,
          description,
          deal_id: followupTask.deal_id,
          updated_by: req.user?.username,
        },
        {
          where: { id },
        }
      );

      // Delete existing notifications for this task
      await Notification.destroy({
        where: {
          related_id: id,
        },
      });

      // Generate repeat dates if repeat is configured
      const repeatDates = repeat
        ? generateRepeatDates(repeat, repeat.repeat_start_date)
        : [due_date];

      // Create notifications for each assigned user
      if (assigned_to?.assigned_to) {
        for (const assignedUser of assigned_to.assigned_to) {
          // 1. Create task update notification
          await Notification.create({
            related_id: id,
            users: [assignedUser],
            title: "Task Updated",
            from: req.user?.id,
            client_id: followupTask.client_id,
            message: `Task has been updated: ${
              subject || followupTask.subject
            }`,
            priority: priority || followupTask.priority,
            section: section || followupTask.section,
            parent_id: followupTask.related_id,
            description: `📋 Task Details:
• Subject: ${subject || followupTask.subject}
• Priority: ${priority || followupTask.priority}
• Due Date: ${due_date || followupTask.due_date}
• Status: ${status || followupTask.status}
${
  repeat
    ? `• Repeats: ${repeat.repeat_type} (${repeatDates.length} occurrences)`
    : ""
}
${description ? `\nDescription: ${description}` : ""}`,
            created_by: req.user?.username,
          });

          // 2. Create reminder notification if configured
          if (reminder) {
            await Notification.create({
              related_id: id,
              users: [assignedUser],
              title: "Task Reminder",
              notification_type: "reminder",
              from: req.user?.id,
              client_id: followupTask.client_id,
              date: reminder.reminder_date,
              time: reminder.reminder_time,
              message: `Task reminder: ${subject || followupTask.subject}`,
              priority: priority || followupTask.priority,
              section: section || followupTask.section,
              parent_id: followupTask.related_id,
              description: `⚠️ Task Reminder:
• Subject: ${subject || followupTask.subject}
• Due Date: ${due_date || followupTask.due_date}
• Priority: ${priority || followupTask.priority}
• Status: ${status || followupTask.status}
${description ? `\nDescription: ${description}` : ""}`,
              created_by: req.user?.username,
              is_repeat: false,
            });
          }

          // 3. Create notifications for repeat dates if configured
          if (repeat) {
            for (const date of repeatDates) {
              await Notification.create({
                related_id: id,
                users: [assignedUser],
                title: "Task Due Reminder",
                notification_type: "reminder",
                from: req.user?.id,
                client_id: followupTask.client_id,
                date: date,
                time: repeat.repeat_start_time,
                message: `Task due: ${subject || followupTask.subject}`,
                priority: priority || followupTask.priority,
                section: section || followupTask.section,
                parent_id: followupTask.related_id,
                description: `⚠️ Task Due:  
• Subject: ${subject || followupTask.subject}
• Due Date: ${date}
• Priority: ${priority || followupTask.priority}
• Status: ${status || followupTask.status}
• Repeat Type: ${repeat.repeat_type}
${description ? `\nDescription: ${description}` : ""}`,
                created_by: req.user?.username,
                is_repeat: true,
              });
            }
          }
        }
      }

      // Fetch the updated task
      const updatedTask = await FollowupTask.findByPk(id);

      return responseHandler.success(
        res,
        "Followup task updated successfully",
        updatedTask
      );
    } catch (error) {
      console.error("Error updating task:", error);
      return responseHandler.error(res, error?.message);
    }
  },
};
