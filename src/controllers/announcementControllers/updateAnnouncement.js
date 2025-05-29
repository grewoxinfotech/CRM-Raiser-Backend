import Announcement from "../../models/announcementModel.js";
import Notification from "../../models/notificationModel.js";
import responseHandler from "../../utils/responseHandler.js";
import dayjs from "dayjs";
import Joi from "joi";
import validator from "../../utils/validator.js";

export default {
    validator: validator({
        params: Joi.object({
            id: Joi.string().required()
        }),
        body: Joi.object({
            title: Joi.string().required(),
            description: Joi.string().required(),
            time: Joi.string().required(),
            date: Joi.string().required(),
            branch: Joi.object({
                branch: Joi.array().items(Joi.string())
            }).optional().allow('', null),
        })
    }),
    handler: async (req, res) => {
        const { title, description, branch, time, date } = req.body;
        const { id } = req.params;
        try {
            const announcement = await Announcement.findByPk(id);
            if (!announcement) {
                return responseHandler.error(res, "Announcement not found");
            }

            // Update announcement
            await announcement.update({ 
                title, 
                description, 
                branch, 
                time,
                date,
                updated_by: req.user?.username 
            });

            // Calculate reminder time (2 minutes before)
            const [hours, minutes] = time.split(":").map(Number);
            let reminderHours = hours;
            let reminderMinutes = minutes - 2;

            if (reminderMinutes < 0) {
                reminderHours = hours - 1;
                reminderMinutes = 58;
                if (reminderHours < 0) {
                    reminderHours = 23;
                }
            }

            const reminderTime = `${String(reminderHours).padStart(2, "0")}:${String(reminderMinutes).padStart(2, "0")}:00`;

            // Get users array from branch
            const users = branch?.branch || [];

            // Delete existing notifications for this announcement
            await Notification.destroy({
                where: {
                    related_id: announcement.id,
                    section: "announcement"
                }
            });

            // 1. Create updated announcement notification
            await Notification.create({
                related_id: announcement.id,
                users: users,
                title: "Announcement Updated",
                from: req.user?.id,
                client_id: req.des?.client_id,
                section: "announcement",
                parent_id: req.user?.id,
                message: `Announcement updated by ${req.user.username}: ${title}`,
                description: `📢 Updated Announcement:
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

            // 3. Create reminder notification
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

            return responseHandler.success(res, "Announcement updated successfully", announcement);
        } catch (error) {
            return responseHandler.error(res, error?.message);
        }
    }
}
