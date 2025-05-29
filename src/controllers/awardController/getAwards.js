import Joi from "joi";
import Award from "../../models/awardModel.js";
import responseHandler from "../../utils/responseHandler.js";
import validator from "../../utils/validator.js";

export default {
    validator: validator({
        query: Joi.object({
            page: Joi.number().optional(),
            limit: Joi.number().optional(),
        })
    }),
    handler: async (req, res) => {
        try {
            const awards = await Award.findAll();
            if (!awards) {
                return responseHandler.error(res, "No awards found");
            }
            return responseHandler.success(res, "Awards fetched successfully", awards);
        } catch (error) {
            return responseHandler.error(res, error?.message);
        }
    }
}

