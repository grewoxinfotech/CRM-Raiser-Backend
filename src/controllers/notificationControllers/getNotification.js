// import Joi from "joi";
// import validator from "../../utils/validator.js";
// import Notification from "../../models/notificationModel.js";
// import responseHandler from "../../utils/responseHandler.js";
// import { Op } from "sequelize";
// import moment from "moment";

// export default {
//     validator: validator({
//         query: Joi.object({
//             page: Joi.number().optional(),
//             limit: Joi.number().optional()
//         })
//     }),
//     handler: async (req, res) => {
//         try {
//             const currentDate = moment().format('YYYY-MM-DD');
//             const currentTime = moment().format('HH:mm:00');
//             const userId = req.user.id;

//             console.log('Current DateTime:', {
//                 date: currentDate,
//                 time: currentTime,
//                 fullTime: new Date().toLocaleTimeString(),
//                 timestamp: new Date().toISOString()
//             });

//             // Get all unread notifications
//             const allNotifications = await Notification.findAll({
//                 where: {
//                     read: false
//                 }
//             });

//             // Log all reminders first for time comparison
//             console.log('All unread reminders:');
//             allNotifications.forEach(n => {
//                 if (n.notification_type === 'reminder') {
//                     console.log({
//                         id: n.id,
//                         reminderTime: n.time,
//                         currentTime: currentTime,
//                         timeMatch: n.time === currentTime,
//                         date: moment(n.date).format('YYYY-MM-DD'),
//                         dateMatch: moment(n.date).format('YYYY-MM-DD') === currentDate,
//                         title: n.title
//                     });
//                 }
//             });

//             // Separate normal and reminder notifications
//             const normalNotifications = allNotifications.filter(n => {
//                 try {
//                     const users = JSON.parse(n.users);
//                     return n.notification_type === 'normal' && users.includes(userId);
//                 } catch (e) {
//                     console.error('Error parsing users for notification:', n.id, e);
//                     return false;
//                 }
//             });

//             // Get reminders that match current time exactly
//             const currentReminders = allNotifications.filter(n => {
//                 try {
//                     const users = JSON.parse(n.users);
//                     const reminderDate = moment(n.date).format('YYYY-MM-DD');
//                     const timeMatch = n.time === currentTime;
//                     const dateMatch = reminderDate === currentDate;
//                     const userMatch = users.includes(userId);

//                     console.log('Checking reminder time match:', {
//                         id: n.id,
//                         reminderTime: n.time,
//                         currentTime: currentTime,
//                         timeMatch,
//                         dateMatch,
//                         userMatch,
//                         title: n.title
//                     });

//                     return n.notification_type === 'reminder' && 
//                            userMatch &&
//                            dateMatch &&
//                            timeMatch;
//                 } catch (e) {
//                     console.error('Error parsing users for reminder:', n.id, e);
//                     return false;
//                 }
//             });

//             console.log('Found notifications:', {
//                 total: allNotifications.length,
//                 normal: normalNotifications.length,
//                 currentReminders: currentReminders.length
//             });

//             // Emit current reminders via socket
//             if (currentReminders.length > 0) {
//                 console.log('Emitting reminders:', currentReminders.map(n => ({
//                     id: n.id,
//                     time: n.time,
//                     currentTime: currentTime,
//                     title: n.title
//                 })));

//                 if (global.io) {
//                     currentReminders.forEach(notification => {
//                         const users = JSON.parse(notification.users);
//                         users.forEach(userId => {
//                             console.log('Emitting reminder:', {
//                                 id: notification.id,
//                                 time: notification.time,
//                                 read:notification.read,
//                                 currentTime: currentTime,
//                                 title: notification.title,
//                                 userId: userId
//                             });
//                             global.io.to(userId).emit('reminder', {
//                                 id: notification.id,
//                                 title: notification.title,
//                                 message: notification.message,
//                                 description: notification.description,
//                                 date: notification.date,
//                                 time: notification.time,
//                                 notification_type: notification.notification_type,
//                                 created_at: notification.createdAt
//                             });
//                         });
//                     });
//                 }
//             }

//             // Only return normal notifications
//             return responseHandler.success(res, "Notifications fetched successfully", normalNotifications);
//         } catch (error) {
//             console.error('Error in getNotification:', error);
//             return responseHandler.error(res, error?.message);
//         }
//     },
// };


import Joi from "joi";
import validator from "../../utils/validator.js";
import Notification from "../../models/notificationModel.js";
import responseHandler from "../../utils/responseHandler.js";
import User from "../../models/userModel.js";
import Role from "../../models/roleModel.js";
import { Op } from "sequelize";
import moment from "moment";
export default {
    validator: validator({
        params: Joi.object({
            id: Joi.string().required()
        }),
        query: Joi.object({
            page: Joi.number().optional(),
            limit: Joi.number().optional()
        })
    }),
    handler: async (req, res) => {
        try {
            const userRole = req.user.role;
            let notifications;
            // Find role in role model
            const role = await Role.findOne({
                where: { id: userRole }
            });
            if (!role) {
                return responseHandler.error(res, "Role not found");
            }
            const currentDate = moment().format('YYYY-MM-DD');
            const currentTime = moment().format('HH:mm:00');
            // console.log('Current Date Time:', {
            //     currentDate,
            //     currentTime,
            //     timestamp: new Date().toISOString()
            // });
            const whereClause = {
                read: false,
                [Op.or]: [
                    { notification_type: 'normal' }, // Normal notifications
                    {
                        notification_type: 'reminder',
                        [Op.or]: [
                            { date: currentDate }, // Today's reminders
                            {
                                date: {
                                    [Op.gt]: currentDate // Future reminders
                                }
                            }
                        ]
                    }
                ]
            };
            if (role.role_name === 'client') {
                whereClause.client_id = req.user.id;
                notifications = await Notification.findAll({
                    where: whereClause,
                    order: [['createdAt', 'DESC']]
                });
            } else {
                const user = await User.findOne({
                    where: { id: req.user.id }
                });
                if (!user) {
                    return responseHandler.error(res, "User not found");
                }
                whereClause.client_id = user.client_id;
                notifications = await Notification.findAll({
                    where: whereClause,
                    order: [['createdAt', 'DESC']]
                });
            }

            // Log all notifications for debugging
            notifications.forEach(notification => {
                // console.log('Notification Details:', {
                //     id: notification.id,
                //     type: notification.notification_type,
                //     title: notification.title,
                //     message: notification.message,
                //     date: notification.date,
                //     time: notification.time,
                //     users: notification.users,
                //     client_id: notification.client_id,
                //     read: notification.read,
                //     created_at: notification.createdAt,
                //     updated_at: notification.updatedAt
                // });
            });

            // Separate and log passed and upcoming reminders for today
            const filteredNotifications = notifications.filter(notif => {
                if (notif.notification_type !== 'reminder') {
                    return true; // Keep all non-reminder notifications
                }

                // For reminders, check if it's time to show them
                const reminderDate = moment(notif.date).format('YYYY-MM-DD');
                const dateMatch = reminderDate === currentDate;
                const timeMatch = notif.time === currentTime;
                const timeDiff = moment(notif.time, 'HH:mm:ss').diff(moment(currentTime, 'HH:mm:ss'), 'minutes');

                // Log the status for debugging
                if (dateMatch) {
                    if (timeDiff < 0) {
                        // console.log('Passed Due Reminder:', {
                        //     id: notif.id,
                        //     title: notif.title,
                        //     scheduledTime: notif.time,
                        //     currentTime: currentTime,
                        //     minutesPassed: Math.abs(timeDiff),
                        //     status: 'PASSED_DUE',
                        //     willShow: true
                        // });
                        return true; // Show passed due reminders
                    } else if (timeMatch) {
                        // console.log('Current Time Reminder:', {
                        //     id: notif.id,
                        //     title: notif.title,
                        //     scheduledTime: notif.time,
                        //     currentTime: currentTime,
                        //     status: 'CURRENT',
                        //     willShow: true
                        // });
                        return true; // Show current time reminders
                    } else {
                        // console.log('Upcoming Reminder:', {
                        //     id: notif.id,
                        //     title: notif.title,
                        //     scheduledTime: notif.time,
                        //     currentTime: currentTime,
                        //     minutesUntilDue: timeDiff,
                        //     status: 'UPCOMING',
                        //     willShow: false
                        // });
                        return false; // Don't show upcoming reminders
                    }
                }
                
                return false; // Don't show reminders for other dates
            });

            // Log final filtered notifications
            // console.log('Sending to frontend:', {
            //     total: filteredNotifications.length,
            //     normal: filteredNotifications.filter(n => n.notification_type === 'normal').length,
            //     reminders: filteredNotifications.filter(n => n.notification_type === 'reminder').length
            // });

            return responseHandler.success(res, "Notifications fetched successfully", filteredNotifications);
        } catch (error) {
            console.error('Error in getNotification:', error);
            return responseHandler.error(res, error?.message);
        }
    },
};