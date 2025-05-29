import Joi from "joi";
import Policy from "../../models/policyModel.js";
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
            const policy = await Policy.findByPk(id);
            if (!policy) {
                return responseHandler.error(res, "Policy not found");
            }
            return responseHandler.success(res, "Policy fetched successfully", policy);
        } catch (error) {
            return responseHandler.error(res, error?.message);
        }
    }
}
