import Joi from "joi";
import Calendar from "../../models/calendarModel.js";
import Notification from "../../models/notificationModel.js";
import responseHandler from "../../utils/responseHandler.js";
import validator from "../../utils/validator.js";
import dayjs from "dayjs";

export default {
    validator: validator({
        body: Joi.object({
            name: Joi.string().required(),
            label: Joi.string().required(),
            startDate: Joi.date().required(),
            endDate: Joi.date().required(),
            color: Joi.string().required(),
        })
    }),
    handler: async (req, res) => {
        try {
            const { name, label, startDate, endDate, color } = req.body;

           

            const existingCalendar = await Calendar.findOne({ where: { name } });
            if (existingCalendar) {
                console.log('Calendar Creation Failed: Name already exists', { name });
                return responseHandler.error(res, "Calendar name already exists");
            }

            const calendar = await Calendar.create({
                name,
                label,
                startDate,
                endDate,
                color,
                client_id: req.des?.client_id,
                created_by: req.user?.username
            });

            // Create notification for event start
            const eventStartDate = dayjs(startDate);
            const eventDate = eventStartDate.format('YYYY-MM-DD');
            const eventTime = eventStartDate.format('HH:mm:ss');
            
            // Calculate reminder time (2 minutes before)
            const reminderDate = eventStartDate.subtract(2, 'minute');
            const reminderTime = reminderDate.format('HH:mm:ss');

            // 1. Create notification for event start
            await Notification.create({
                related_id: calendar.id,
                users: [req.user?.id],
                title: "Calendar Event Starting",
                notification_type: "reminder",
                section: "calendar",
                parent_id: req.user?.id,
                from: req.user?.id,
                client_id: req.des?.client_id,
                date: eventDate,
                time: eventTime,
                message: `Event starting: ${name}`,
                description: `📅 Event Details:
• Title: ${name}
• Start Time: ${eventTime}
• End Time: ${dayjs(endDate).format('HH:mm:ss')}`,
                created_by: req.user?.username
            });

            // 2. Create reminder notification (2 minutes before)
            await Notification.create({
                related_id: calendar.id,
                users: [req.user?.id],
                title: "Event Starting Soon",
                notification_type: "reminder",
                section: "calendar",
                parent_id: req.user?.id,
                from: req.user?.id,
                client_id: req.des?.client_id,
                date: eventDate,
                time: reminderTime,
                message: `Event starting in 2 minutes: ${name}`,
                description: `⏰ Upcoming Event:
• Title: ${name}
• Starts in: 2 minutes
• Start Time: ${eventTime}
• End Time: ${dayjs(endDate).format('HH:mm:ss')}`,
                created_by: req.user?.username
            });

            console.log('Calendar Created Successfully:', {
                id: calendar.id,
                name: calendar.name,
                
                startDate: new Date(calendar.startDate).toLocaleString(),
                endDate: new Date(calendar.endDate).toLocaleString(),
                createdBy: calendar.created_by,
                notifications: {
                    eventTime: eventTime,
                    reminderTime: reminderTime
                }
            });

            return responseHandler.success(res, "Calendar created successfully", calendar);
        } catch (error) {
            console.error('Calendar Creation Error:', error);
            return responseHandler.error(res, error);
        }
    }
}

