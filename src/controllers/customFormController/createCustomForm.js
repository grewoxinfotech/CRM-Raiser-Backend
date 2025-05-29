import Joi from "joi";
import validator from "../../utils/validator.js";
import CustomForm from "../../models/customFormModel.js";
import Notification from "../../models/notificationModel.js";
import responseHandler from "../../utils/responseHandler.js";
import dayjs from "dayjs";

export default {
  validator: validator({
    body: Joi.object({
      title: Joi.string().required(),
      description: Joi.string().required(),
      event_name: Joi.string().required(),
      event_location: Joi.string().required(),
      start_date: Joi.date().required(),
      end_date: Joi.date().min(Joi.ref("start_date")).required().messages({
        "date.min": "End date must be later than start date",
      }),
      fields: Joi.object().required(),
    }),
  }),
  handler: async (req, res) => {
    try {
      const {
        title,
        description,
        event_name,
        event_location,
        start_date,
        end_date,
        fields,
      } = req.body;

      const customForm = await CustomForm.create({
        title,
        description,
        event_name,
        event_location,
        start_date,
        end_date,
        fields,
        client_id: req.des?.client_id,
        created_by: req.user?.username,
      });

      // Get working hours notification time (10:00 AM)
      const notificationTime = "10:00:00";
      const formattedStartDate = dayjs(start_date).format("YYYY-MM-DD");

      // Create notification for the start date during working hours
      await Notification.create({
        related_id: customForm.id,
        users: [req.user?.id],
        title: "Custom Form Event Reminder",
        notification_type: "reminder",
        from: req.user?.id,
        client_id: req.des?.client_id,
        date: formattedStartDate,
        time: notificationTime,
        message: `Event starting today: ${event_name}`,
        description: `📅 Event Details:
• Title: ${title}
• Event: ${event_name}
• Location: ${event_location}
• Start Date: ${formattedStartDate}
• End Date: ${dayjs(end_date).format("YYYY-MM-DD")}

${description}`,
        created_by: req.user?.username,
      });

      return responseHandler.success(
        res,
        "Custom form created successfully",
        customForm
      );
    } catch (error) {
      console.error("Custom Form Creation Error:", error);
      return responseHandler.error(res, error?.message);
    }
  },
};
