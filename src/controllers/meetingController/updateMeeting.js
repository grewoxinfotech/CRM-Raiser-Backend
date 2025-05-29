import Joi from "joi";
import validator from "../../utils/validator.js";
import Meeting from "../../models/meetingModel.js";
import Notification from "../../models/notificationModel.js";
import responseHandler from "../../utils/responseHandler.js";
import { Op } from "sequelize";
import dayjs from "dayjs";

export default {
    validator: validator({
        params: Joi.object({
            id: Joi.string().required()
        }),
        body: Joi.object({
            department: Joi.string().optional(),
            employee: Joi.any().optional(),
            title: Joi.string().optional(),
            date: Joi.date().optional(),
            startTime: Joi.string().optional(),
            endTime: Joi.string().optional(),
            description: Joi.string().optional(),
            meetingLink: Joi.string().optional(),
            client: Joi.string().optional().allow("",null),
            status: Joi.string().optional()
        })
    }),
    handler: async (req, res) => {
        const { id } = req.params;
        const { title, date, startTime, endTime, description, meetingLink, status, department, client, employee } = req.body;


// console.log("asklndlasdkaklkaknd",req.body)

        try {
            const meeting = await Meeting.findByPk(id);
            if (!meeting) {
                return responseHandler.notFound(res, "Meeting not found");
            }

            const existingMeeting = await Meeting.findOne({ 
                where: { 
                    title, date, startTime, endTime, description, meetingLink, 
                    status, client, department, employee, 
                    id: { [Op.not]: id } 
                } 
            });
            
            if (existingMeeting) {
                return responseHandler.error(res, "Meeting already exists");
            }

            // Update meeting
            await meeting.update({ 
                title, date, startTime, endTime, description, 
                meetingLink, status, client, department, employee 
            });

            // Delete existing notifications
            await Notification.destroy({
                where: {
                    related_id: meeting.id,
                    section: "meeting"
                }
            });

            // Create notifications for each assigned employee
            const employees = Array.isArray(employee) ? employee : [employee];
            let notificationCount = 0;

            for (const assignedUser of employees) {
                // 1. Create meeting update notification
                await Notification.create({
                    related_id: meeting.id,
                    users: [assignedUser],
                    title: "Meeting Updated",
                    from: req.user?.id,
                    client_id: req.des?.client_id,
                    section: "meeting",
                    parent_id: req.user?.id,
                    message: `${req.user?.username} updated meeting: ${title}`,
                    description: `📅 Updated Meeting Details:
• Title: ${title}
• Date: ${dayjs(date).format('YYYY-MM-DD')}
• Start Time: ${startTime}
${endTime ? `• End Time: ${endTime}` : ''}
${meetingLink ? `• Meeting Link: ${meetingLink}` : ''}
• Department: ${department}
• Status: ${status}
${description ? `\nDescription: ${description}` : ''}`,
                    created_by: req.user?.username,
                });
                notificationCount++;

                // 2. Create notification for meeting start time
                await Notification.create({
                    related_id: meeting.id,
                    users: [assignedUser],
                    title: "Meeting Starting",
                    notification_type: "reminder",
                    from: req.user?.id,
                    client_id: req.des?.client_id,
                    date: dayjs(date).format('YYYY-MM-DD'),
                    time: startTime,
                    section: "meeting",
                    parent_id: req.user?.id,
                    message: `Meeting starting: ${title}`,
                    description: `📅 Meeting Details:
• Title: ${title}
• Start Time: ${startTime}
${endTime ? `• End Time: ${endTime}` : ''}
${meetingLink ? `• Meeting Link: ${meetingLink}` : ''}
• Department: ${department}
${description ? `\nDescription: ${description}` : ''}`,
                    created_by: req.user?.username
                });
                notificationCount++;

                // 3. Create reminder notification (2 minutes before)
                const [hours, minutes] = startTime.split(':').map(Number);
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
                const reminderTime = `${String(reminderHours).padStart(2, '0')}:${String(reminderMinutes).padStart(2, '0')}:00`;

                await Notification.create({
                    related_id: meeting.id,
                    users: [assignedUser],
                    title: "Meeting Starting Soon",
                    notification_type: "reminder",
                    from: req.user?.id,
                    client_id: req.des?.client_id,
                    date: dayjs(date).format('YYYY-MM-DD'),
                    time: reminderTime,
                    section: "meeting",
                    parent_id: req.user?.id,
                    message: `Meeting starting in 2 minutes: ${title}`,
                    description: `⏰ Upcoming Meeting:
• Title: ${title}
• Starts in: 2 minutes
• Start Time: ${startTime}
${endTime ? `• End Time: ${endTime}` : ''}
${meetingLink ? `• Meeting Link: ${meetingLink}` : ''}
• Department: ${department}
${description ? `\nDescription: ${description}` : ''}`,
                    created_by: req.user?.username
                });
                notificationCount++;
            }

            console.log('Meeting Notifications Updated:', {
                title,
                date: dayjs(date).format('YYYY-MM-DD'),
                startTime,
                notificationCount
            });

            return responseHandler.success(res, "Meeting updated successfully", { meeting, notificationCount });
        } catch (error) {
            return responseHandler.error(res, error?.message);
        }
    }
}