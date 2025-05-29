import Joi from "joi";
import Reminder from "../../models/reminderModel.js";
import validator from "../../utils/validator.js";
import responseHandler from "../../utils/responseHandler.js";
import { Op } from "sequelize";
import Notification from "../../models/notificationModel.js";
import isSameDay from "../../utils/isSameDay.js";

export default {
    validator: validator({
        params: Joi.object({
            id: Joi.string().required()
        }),
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
            const { id } = req.params;
            const { start_date, users, description } = req.body;

            const reminder = await Reminder.findByPk(id);
            if (!reminder) {
                return responseHandler.error(res, "Reminder not found");
            }

            const existingReminder = await Reminder.findOne({ where: { start_date, users, description, id: { [Op.not]: id } } });
            if (existingReminder) {
                return responseHandler.error(res, "Reminder already exists");
            }

            await reminder.update({ start_date, users, description, updated_by: req.user?.username });

            // Create notification if reminder is for today
            const today = new Date();
            const reminderDate = new Date(start_date);

            if (isSameDay(reminderDate, today)) {
                await Notification.create({
                    related_id: reminder.id,
                    users: users,
                    title: "Lead Reminder",
                    notification_type: "reminder",
                    from: req.user?.id,
                    client_id: req.des?.client_id,
                    message: `Reminder from ${req.user?.username}: ${description}`,
                    description: `Reminder Date: ${start_date}`,
                    created_by: req.user?.username
                });
            }

            return responseHandler.success(res, "Reminder updated successfully", reminder);
        } catch (error) {
            console.error("Error in reminder update:", {
                error: error.message,
                stack: error.stack
            });
            return responseHandler.error(res, error?.message);
        }
    }
}   