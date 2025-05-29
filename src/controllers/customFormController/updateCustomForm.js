import Joi from "joi";
import validator from "../../utils/validator.js";
import CustomForm from "../../models/customFormModel.js";
import Notification from "../../models/notificationModel.js";
import responseHandler from "../../utils/responseHandler.js";
import dayjs from "dayjs";

export default {
  validator: validator({
    params: Joi.object({
      id: Joi.string().required(),
    }),
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
      const { id } = req.params;
      const {
        title,
        description,
        event_name,
        event_location,
        start_date,
        end_date,
        fields,
      } = req.body;

      const customForm = await CustomForm.findByPk(id);

      if (!customForm) {
        return responseHandler.error(res, "Custom form not found");
      }

      await customForm.update({
        title,
        description,
        event_name,
        event_location,
        start_date,
        end_date,
        fields,
        updated_by: req.user?.username,
      });

      // Update existing notification
      const existingNotification = await Notification.findOne({
        where: { related_id: id },
      });

      if (existingNotification) {
        const notificationTime = "10:00:00";
        const formattedStartDate = dayjs(start_date).format("YYYY-MM-DD");

        await existingNotification.update({
          users: [req.user?.id],
          title: "Custom Form Event Updated",
          notification_type: "reminder",
          from: req.user?.id,
          client_id: req.des?.client_id,
          date: formattedStartDate,
          time: notificationTime,
          message: `Event updated: ${event_name}`,
          description: `📅 Updated Event Details:
• Title: ${title}
• Event: ${event_name}
• Location: ${event_location}
• Start Date: ${formattedStartDate}
• End Date: ${dayjs(end_date).format("YYYY-MM-DD")}

${description}`,
          updated_by: req.user?.username,
        });
      }

      return responseHandler.success(
        res,
        "Custom form updated successfully",
        customForm
      );
    } catch (error) {
      return responseHandler.error(res, error?.message);
    }
  },
};
