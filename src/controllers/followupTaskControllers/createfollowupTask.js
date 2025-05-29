import FollowupTask from "../../models/followupTaskModel.js";
import responseHandler from "../../utils/responseHandler.js";
import Joi from "joi";
import validator from "../../utils/validator.js";
import Notification from "../../models/notificationModel.js";
import dayjs from "dayjs";

// Helper function to generate dates for repeated tasks
const generateRepeatDates = (repeat, startDate) => {
  const dates = [];
  // Use repeat_start_date if available, otherwise use startDate (due_date)
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
      subject: Joi.string().required(),
      section: Joi.string().required(),
      due_date: Joi.string().required(),
      priority: Joi.string()
        .valid("highest", "high", "medium", "low")
        .required(),
      task_reporter: Joi.string().optional().allow("", null),
      assigned_to: Joi.object({
        assigned_to: Joi.array().items(Joi.string()).required(),
      }).required(),
      status: Joi.string()
        .valid(
          "not_started",
          "in_progress",
          "completed",
          "on_hold",
          "cancelled"
        )
        .required(),
      reminder: Joi.object({
        reminder_date: Joi.string().required(),
        reminder_time: Joi.string().required(),
      }).allow(null),
      repeat: Joi.object().allow(null),
      description: Joi.string().allow("", null),
    }),
  }),

  handler: async (req, res) => {
    try {
      const { id } = req.params;
      const { repeat, reminder, ...taskData } = req.body;

      // Create the task with all fields from model
      const task = await FollowupTask.create({
        ...taskData,
        reminder: reminder || null,
        task_reporter: req.user?.id,
        repeat: repeat || null,
        client_id: req.des?.client_id,
        related_id: id,
        created_by: req.user?.username,
      });

      // Generate repeat dates if repeat is configured - use repeat_start_date
      const repeatDates = repeat
        ? generateRepeatDates(repeat, repeat.repeat_start_date)
        : [taskData.due_date];

      // Create notifications for each assigned user
      for (const assignedUser of taskData.assigned_to.assigned_to) {
        // 1. Create task assignment notification
        await Notification.create({
          related_id: task.id,
          users: [assignedUser],
          title: "New Task Assignment",
          from: req.user?.id,
          client_id: req.des?.client_id,
          message: `You have been assigned a new task: ${taskData.subject}`,
          priority: taskData.priority,
          section: taskData.section,
          parent_id: id,
          description: `📋 Task Details:
• Subject: ${taskData.subject}
• Priority: ${taskData.priority}
• Due Date: ${taskData.due_date}
• Status: ${taskData.status}
${
  repeat
    ? `• Repeats: ${repeat.repeat_type} (${repeatDates.length} occurrences)`
    : ""
}
${taskData.description ? `\nDescription: ${taskData.description}` : ""}`,
          created_by: req.user?.username,
        });

        // 2. Create reminder notification if configured
        if (reminder) {
          await Notification.create({
            related_id: task.id,
            users: [assignedUser],
            title: "Task Reminder",
            notification_type: "reminder",
            from: req.user?.id,
            client_id: req.des?.client_id,
            date: reminder.reminder_date,
            time: reminder.reminder_time,
            message: `Task reminder: ${taskData.subject}`,
            priority: taskData.priority,
            section: taskData.section,
            parent_id: id,
            description: `⚠️ Task Reminder:
• Subject: ${taskData.subject}
• Due Date: ${taskData.due_date}
• Priority: ${taskData.priority}
• Status: ${taskData.status}
${taskData.description ? `\nDescription: ${taskData.description}` : ""}`,
            created_by: req.user?.username,
            is_repeat: false,
          });
        }

        // 3. Create notifications for repeat dates if configured
        if (repeat) {
          for (const date of repeatDates) {
            await Notification.create({
              related_id: task.id,
              users: [assignedUser],
              title: "Task Due Reminder",
              notification_type: "reminder",
              from: req.user?.id,
              client_id: req.des?.client_id,
              date: date,
              time: repeat.repeat_start_time,
              section: taskData.section,
              parent_id: id,
              message: `Task due: ${taskData.subject}`,
              priority: taskData.priority,
              description: `⚠️ Task Due:
• Subject: ${taskData.subject}
• Due Date: ${date}
• Priority: ${taskData.priority}
• Status: ${taskData.status}
• Repeat Type: ${repeat.repeat_type}
${taskData.description ? `\nDescription: ${taskData.description}` : ""}`,
              created_by: req.user?.username,
              is_repeat: true,
            });
          }
        }
      }

      return responseHandler.success(res, "Task created successfully!", task);
    } catch (error) {
      console.error("Error creating task:", error);
      return responseHandler.error(res, error?.message);
    }
  },
};

// Helper function to generate human-readable repeat description
function getRepeatDescription(repeat) {
  // if (repeat.repeat_type === 'custom' && repeat.custom_repeat_frequency === 'monthly') {
  //     const pattern = repeat.custom_repeat_pattern;
  //     if (pattern?.type === 'day_position') {
  //         return `Every ${repeat.custom_repeat_interval} month(s) on the ${pattern.position} ${pattern.day}`;
  //     }
  // }
  // return `${repeat.repeat_type}`; // Basic description for other repeat types
}

// Add this helper function
function getWeekDays(days) {
  const weekDays = [
    "Sunday",
    "Monday",
    "Tuesday",
    "Wednesday",
    "Thursday",
    "Friday",
    "Saturday",
  ];
  return days.map((day) => weekDays[day]).join(" and ");
}
