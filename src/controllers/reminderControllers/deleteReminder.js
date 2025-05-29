import Joi from "joi";
import validator from "../../utils/validator.js";
import responseHandler from "../../utils/responseHandler.js";
import Reminder from "../../models/reminderModel.js";

export default {
    validator: validator({
        params: Joi.object({
            id: Joi.string().required()
        })
    }),
    handler: async (req, res) => {
        try {
            const { id } = req.params;

            const reminder = await Reminder.findByPk(id);

            if (!reminder) {
                return responseHandler.notFound(res, "Reminder not found");
            }

                await reminder.destroy();

            return responseHandler.success(res, "Reminder deleted successfully", reminder);
        } catch (error) {

            return responseHandler.error(res, error?.message);
        }
    }
};   