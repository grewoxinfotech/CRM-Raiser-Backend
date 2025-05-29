import Joi from "joi";
import TraingingType from "../../models/TraingingTypeModel.js";
import responseHandler from "../../utils/responseHandler.js";
import validator from "../../utils/validator.js";

export default {
    validator: validator({
        query: Joi.object({
            page: Joi.number().optional(),
            limit: Joi.number().optional()
        })
    }),
    handler: async (req, res) => {
        try {
            const traingingType = await TraingingType.findAll();
            if (!traingingType) {
                return responseHandler.error(res, "Trainging types not found");
            }
            return responseHandler.success(res, "Trainging types fetched successfully", traingingType);
        } catch (error) {
            return responseHandler.error(res, error?.message);
        }
    }
}