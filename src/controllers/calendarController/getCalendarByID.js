import Joi from "joi";
import Calendar from "../../models/calendarModel.js";
import responseHandler from "../../utils/responseHandler.js";
import validator from "../../utils/validator.js";

export default {
    validator: validator({
        params: Joi.object({
            id: Joi.string().required()
        })
    }),
    handler: async (req, res) => {
        try {
            const { id } = req.params;

            const calendar = await Calendar.findOne({ where: { id } });
            if (!calendar) {
                return responseHandler.error(res, "Calendar not found");
            }

            return responseHandler.success(res, "Calendar fetched successfully", calendar);
        } catch (error) {
            return responseHandler.error(res, error?.message);
        }
    }
}

