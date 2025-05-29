import Joi from "joi";
import validator from "../../utils/validator.js";
import responseHandler from "../../utils/responseHandler.js";
import Reminder from "../../models/reminderModel.js";
import Notification from "../../models/notificationModel.js";
import isSameDay from "../../utils/isSameDay.js";

export default {
    validator: validator({
        body: Joi.object({
            start_date: Joi.date().required(),
            users: Joi.object({
                users: Joi.array().items(Joi.string()).optional()
            }).optional(),
            description: Joi.string().required()
        })
    }),
    handler: async (req, res) => {
        try {
            const { start_date, users, description } = req.body;

            // Create reminder
            const reminder = await Reminder.create({
                start_date,
                users,
                description,
                client_id: req.des?.client_id,
                created_by: req.user?.username
            });

            // Create notifications for reminders
            const today = new Date();
            const reminderDate = new Date(start_date);

            if (isSameDay(reminderDate, today)) {
                
                const notification = await Notification.create({
                    related_id: reminder.id,
                    users,
                    title: "Lead Reminder",
                    notification_type: "reminder",
                    from: req.user?.id,
                    client_id: req.des?.client_id,
                    message: `Reminder from ${req.user?.username}: ${description}`,
                    description: `Reminder Date: ${start_date}`,
                    created_by: req.user?.username
                });
            }

            return responseHandler.success(res, "Reminder created successfully", reminder);
        } catch (error) {
            console.error("Error in reminder creation:", {
                error: error.message,
                stack: error.stack
            });
            return responseHandler.error(res, error?.message);
        }
    }
}