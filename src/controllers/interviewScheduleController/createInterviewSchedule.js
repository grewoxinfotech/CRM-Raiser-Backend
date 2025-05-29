import Joi from "joi";
import validator from "../../utils/validator.js";
import InterviewSchedule from "../../models/interviewSchedule.js";
import Notification from "../../models/notificationModel.js";
import responseHandler from "../../utils/responseHandler.js";
import dayjs from "dayjs";

export default {
    validator: validator({
        body: Joi.object({
            job: Joi.string().required(),
            candidate: Joi.string().required(),
            interviewer: Joi.string().required(),
            round: Joi.array().items(Joi.string()).required(),
            interviewType: Joi.string().required(),
            startOn: Joi.date().required(),
            startTime: Joi.string().required(),
            commentForInterviewer: Joi.string().optional(),
            commentForCandidate: Joi.string().optional(),
        })
    }),
    handler: async (req, res) => {
        try {
            const {
                job,
                candidate,
                interviewer,
                round,
                interviewType,
                startOn,
                startTime,
                commentForInterviewer,
                commentForCandidate
            } = req.body;

            console.log('Creating Interview Schedule:', {
                job,
                candidate,
                interviewer,
                startOn,
                startTime,
                interviewType
            });

            // Convert round array to string for comparison
            const roundString = JSON.stringify(round);

            const existingInterviewSchedule = await InterviewSchedule.findOne({
                where: {
                    job,
                    candidate,
                    interviewer,
                    interviewType,
                    startOn,
                    startTime,
                    round: roundString
                }
            });

            if (existingInterviewSchedule) {
                return responseHandler.error(res, "Interview schedule already exists");
            }

            const interviewSchedule = await InterviewSchedule.create({
                job,
                candidate,
                interviewer,
                round: roundString,
                interviewType,
                startOn,
                startTime,
                commentForInterviewer,
                commentForCandidate,
                client_id: req.des?.client_id,
                created_by: req.user?.username
            });

            // Calculate reminder time (2 minutes before)
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

            // 1. Create interview schedule notification for both interviewer and candidate
            await Notification.create({
                related_id: interviewSchedule.id,
                users: [interviewer, candidate],
                title: "New Interview Scheduled",
                from: req.user?.id,
                client_id: req.des?.client_id,
                message: `Interview scheduled for ${dayjs(startOn).format('YYYY-MM-DD')} at ${startTime}`,
                description: `📅 Interview Details:
• Job: ${job}
• Type: ${interviewType}
• Date: ${dayjs(startOn).format('YYYY-MM-DD')}
• Time: ${startTime}
• Round: ${round.join(', ')}
${commentForInterviewer ? `\nNote for Interviewer: ${commentForInterviewer}` : ''}
${commentForCandidate ? `\nNote for Candidate: ${commentForCandidate}` : ''}`,
                created_by: req.user?.username,
            });

            // 2. Create notification for interview start time
            await Notification.create({
                related_id: interviewSchedule.id,
                users: [interviewer, candidate],
                title: "Interview Starting",
                notification_type: "reminder",
                from: req.user?.id,
                client_id: req.des?.client_id,
                date: dayjs(startOn).format('YYYY-MM-DD'),
                time: startTime,
                message: `Interview starting now`,
                description: `📅 Interview Details:
• Job: ${job}
• Type: ${interviewType}
• Round: ${round.join(', ')}
${interviewType === 'online' ? `\nPlease join the interview link on time.` : `\nPlease arrive at the venue on time.`}`,
                created_by: req.user?.username
            });

            // 3. Create reminder notification (2 minutes before)
            await Notification.create({
                related_id: interviewSchedule.id,
                users: [interviewer, candidate],
                title: "Interview Starting Soon",
                notification_type: "reminder",
                from: req.user?.id,
                client_id: req.des?.client_id,
                date: dayjs(startOn).format('YYYY-MM-DD'),
                time: reminderTime,
                message: `Interview starting in 2 minutes`,
                description: `⏰ Upcoming Interview:
• Job: ${job}
• Type: ${interviewType}
• Starts in: 2 minutes
• Time: ${startTime}
• Round: ${round.join(', ')}
${interviewType === 'online' ? `\nPlease prepare to join the interview link.` : `\nPlease ensure you're at the venue.`}`,
                created_by: req.user?.username
            });

            return responseHandler.success(res, "Interview schedule created successfully", interviewSchedule);
        } catch (error) {
            console.error('Interview Schedule Creation Error:', error);
            return responseHandler.error(res, error?.message);
        }
    }
}

