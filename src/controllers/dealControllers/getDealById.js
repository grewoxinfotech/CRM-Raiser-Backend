import Joi from "joi";
import Deal from "../../models/dealModel.js";
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
            const deal = await Deal.findByPk(id);
            if (!deal) {
                return responseHandler.error(res, "Deal not found");
            }
            return responseHandler.success(res, "Deal fetched successfully", deal);
        } catch (error) {

            return responseHandler.error(res, error?.message);
        }
    }
}