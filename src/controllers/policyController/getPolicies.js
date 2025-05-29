import Joi from "joi";
import Policy from "../../models/policyModel.js";
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
            const policies = await Policy.findAll();
            if (!policies) {
                return responseHandler.error(res, "No policies found");
            }
            return responseHandler.success(res, "Policies fetched successfully", policies);
        } catch (error) {
            return responseHandler.error(res, error?.message);
        }
    }
}
