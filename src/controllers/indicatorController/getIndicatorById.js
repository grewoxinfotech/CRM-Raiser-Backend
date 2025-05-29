import Joi from "joi";
import Indicator from "../../models/IndicatorModel.js";
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
            const indicator = await Indicator.findByPk(id);
            if (!indicator) {
                return responseHandler.error(res, "Indicator not found");
            }
            return responseHandler.success(res, "Indicator fetched successfully", indicator);
        } catch (error) {
            return responseHandler.error(res, error?.message);
        }
    }
}