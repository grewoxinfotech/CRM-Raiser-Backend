import Joi from "joi";
import SubscriptionPlan from "../../models/subscriptionPlanModel.js";
import validator from "../../utils/validator.js";
import responseHandler from "../../utils/responseHandler.js";

export default {
    validator: validator({
        query: Joi.object({
            status: Joi.string().valid('active', 'inactive').optional()
        })
    }),
    handler: async (req, res) => {
        try {
            const { status } = req.query;
            const whereClause = status ? { status } : {};

            const plans = await SubscriptionPlan.findAll({
                where: whereClause,
                order: [['price', 'ASC']]
            });

            return responseHandler.success(res, "Plans retrieved successfully", plans);
        } catch (error) {

            return responseHandler.error(res, error?.message);
        }
    }
}; 