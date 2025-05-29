import Joi from "joi";
import validator from "../../utils/validator.js";
import Activity from "../../models/activityModel.js";
import responseHandler from "../../utils/responseHandler.js";

export default {
    validator: validator({
        params: Joi.object({
            id: Joi.string().required(),
        }),
    }),
    handler: async (req, res) => {
        try {
            const { id } = req.params;
            const activities = await Activity.findAll({ where: { related_id: id } });
            if (!activities) {
                return responseHandler.error(res, "Activities Not Found");
            }
            return responseHandler.success(res, "Activities fetched successfully", activities);
        } catch (error) {
            return responseHandler.error(res, error?.message);
        }
    }
}
