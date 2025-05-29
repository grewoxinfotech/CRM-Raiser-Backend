import Joi from "joi";
import Calendar from "../../models/calendarModel.js";
import responseHandler from "../../utils/responseHandler.js";
import validator from "../../utils/validator.js";
import { Op } from "sequelize";

export default {
    validator: validator({
        params: Joi.object({
            id: Joi.string().required()
        }),
        body: Joi.object({
            name: Joi.string().optional(),
            startDate: Joi.date().optional(),
            endDate: Joi.date().optional(),
            color: Joi.string().optional()
        })
    }),
    handler: async (req, res) => {
        try {
            const { id } = req.params;
            const { name, startDate, endDate, color } = req.body;

            const calendar = await Calendar.findOne({ where: { id } });
            if (!calendar) {
                return responseHandler.error(res, "Calendar not found");
            }

            const existingCalendar = await Calendar.findOne({ where: { name, id: { [Op.not]: id } } });
            if (existingCalendar) {
                return responseHandler.error(res, "Calendar name already exists");
            }

            await calendar.update({ name, startDate, endDate, color });

            return responseHandler.success(res, "Calendar updated successfully", calendar);
        } catch (error) {
            return responseHandler.error(res, error?.message);
        }
    }
}
