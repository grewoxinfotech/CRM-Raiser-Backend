import Tax from "../../models/taxModel.js";
import responseHandler from "../../utils/responseHandler.js";
import validator from "../../utils/validator.js";
import Joi from "joi";

export default {
    validator: validator,
    params: Joi.object({
        id: Joi.string().required()
    }),
    handler: async (req, res) => {
        try {
            const { id } = req.params;
            const tax = await Tax.findByPk(id);
            return responseHandler.success(res, "Tax fetched successfully", tax);
        } catch (error) {
            return responseHandler.error(res, error?.message);
        }
    }
}