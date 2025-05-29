import Joi from "joi";
import Holiday from "../../models/holidayModel.js";
import Notification from "../../models/notificationModel.js";
import responseHandler from "../../utils/responseHandler.js";
import validator from "../../utils/validator.js";
import dayjs from "dayjs";

export default {
  validator: validator({
    body: Joi.object({
      holiday_name: Joi.string().required(),
      leave_type: Joi.string().required(),
      start_date: Joi.date().required(),
      end_date: Joi.date().required(),
    }),
  }),
  handler: async (req, res) => {
    try {
      const { holiday_name, leave_type, start_date, end_date } = req.body;

      const existingHoliday = await Holiday.findOne({
        where: { holiday_name },
      });
      if (existingHoliday) {
        return responseHandler.error(res, "Holiday already exists");
      }

      const holiday = await Holiday.create({
        holiday_name,
        leave_type,
        start_date,
        end_date,
        client_id: req.des?.client_id,
        created_by: req.user?.username,
      });

      // Calculate notification date (day before start_date)
      const notificationDate = dayjs(start_date).subtract(1, "day");
      const notificationTime = "18:00:00"; // Working hours notification time (10 AM)

      // Create notification for the day before holiday
      await Notification.create({
        related_id: holiday.id,
        users: [req.user?.id],
        title: "Holiday Reminder",
        notification_type: "reminder",
        from: req.user?.id,
        client_id: req.des?.client_id,
        date: notificationDate.format("YYYY-MM-DD"),
        time: notificationTime,
        section: "holiday",
        parent_id: req.user?.id,
        message: `Holiday tomorrow: ${holiday_name}`,
        description: `🏖️ Holiday Details:
• Name: ${holiday_name}
• Type: ${leave_type}
• Start Date: ${dayjs(start_date).format("YYYY-MM-DD")}
• End Date: ${dayjs(end_date).format("YYYY-MM-DD")}
• Duration: ${dayjs(end_date).diff(dayjs(start_date), "days") + 1} days`,
        created_by: req.user?.username,
      });

      return responseHandler.success(
        res,
        "Holiday created successfully",
        holiday
      );
    } catch (error) {
      return responseHandler.error(res, error?.message);
    }
  },
};
