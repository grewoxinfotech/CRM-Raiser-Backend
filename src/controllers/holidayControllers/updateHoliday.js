import Joi from "joi";
import Holiday from "../../models/holidayModel.js";
import Notification from "../../models/notificationModel.js";
import responseHandler from "../../utils/responseHandler.js";
import validator from "../../utils/validator.js";
import { Op } from "sequelize";
import dayjs from "dayjs";

export default {
  validator: validator({
    params: Joi.object({
      id: Joi.string().required(),
    }),
    body: Joi.object({
      holiday_name: Joi.string().optional(),
      leave_type: Joi.string().optional(),
      start_date: Joi.date().optional(),
      end_date: Joi.date().optional(),
    }),
  }),
  handler: async (req, res) => {
    try {
      const { id } = req.params;
      const { holiday_name, leave_type, start_date, end_date } = req.body;

      const holiday = await Holiday.findByPk(id);
      if (!holiday) {
        return responseHandler.error(res, "Holiday not found");
      }

      const existingHoliday = await Holiday.findOne({
        where: { holiday_name, id: { [Op.not]: id } },
      });
      if (existingHoliday) {
        return responseHandler.error(
          res,
          "Holiday with this name already exists"
        );
      }

      // Delete existing notifications for this holiday
      await Notification.destroy({
        where: {
          related_id: id,
          section: "holiday",
        },
        force: true,
      });

      await holiday.update({
        holiday_name,
        leave_type,
        start_date,
        end_date,
        updated_by: req.user?.username,
      });

      // Calculate notification date (day before start_date)
      const notificationDate = dayjs(start_date || holiday.start_date).subtract(
        1,
        "day"
      );
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
        message: `Holiday tomorrow: ${holiday_name || holiday.holiday_name}`,
        description: `🏖️ Holiday Details:
• Name: ${holiday_name || holiday.holiday_name}
• Type: ${leave_type || holiday.leave_type}
• Start Date: ${dayjs(start_date || holiday.start_date).format("YYYY-MM-DD")}
• End Date: ${dayjs(end_date || holiday.end_date).format("YYYY-MM-DD")}
• Duration: ${
          dayjs(end_date || holiday.end_date).diff(
            dayjs(start_date || holiday.start_date),
            "days"
          ) + 1
        } days`,
        created_by: req.user?.username,
      });

      return responseHandler.success(
        res,
        "Holiday updated successfully",
        holiday
      );
    } catch (error) {
      return responseHandler.error(res, error?.message);
    }
  },
};
