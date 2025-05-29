import Joi from "joi";
import AwardType from "../../models/AwardTypeModel.js";
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
            const awardType = await AwardType.findAll();
            if (!awardType) {
                return responseHandler.error(res, "Award types not found");
            }
            return responseHandler.success(res, "Award types fetched successfully", awardType);
        } catch (error) {
            return responseHandler.error(res, error?.message);
        }
    }
}