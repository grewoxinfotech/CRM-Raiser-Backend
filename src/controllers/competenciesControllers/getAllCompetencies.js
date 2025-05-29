import Joi from "joi";
import Competency from "../../models/competencyModel.js";
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
            const competency = await Competency.findAll();
            if (!competency) {
                return responseHandler.error(res, "Competencies not found");
            }
            return responseHandler.success(res, "Competencies fetched successfully", competency);
        } catch (error) {
            return responseHandler.error(res, error?.message);
        }
    }
}