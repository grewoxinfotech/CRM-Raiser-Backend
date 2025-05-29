import Joi from "joi";
import TerminationType from "../../models/TerminationTypeModel.js";
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
            const terminationType = await TerminationType.findAll();
            if (!terminationType) {
                return responseHandler.error(res, "Termination types not found");
            }
            return responseHandler.success(res, "Termination types fetched successfully", terminationType);
        } catch (error) {
            return responseHandler.error(res, error?.message);
        }
    }
}