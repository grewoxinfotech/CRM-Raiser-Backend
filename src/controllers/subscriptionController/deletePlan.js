import Joi from "joi";
import SubscriptionPlan from "../../models/subscriptionPlanModel.js";
import validator from "../../utils/validator.js";
import responseHandler from "../../utils/responseHandler.js";
import { Op } from "sequelize";

export default {
    validator: validator({
        params: Joi.object({
            id: Joi.string().required()
        })
    }),
    handler: async (req, res) => {
        try {
            const { id } = req.params;

            const plan = await SubscriptionPlan.findByPk(id);
            if (!plan) {
                return responseHandler.notFound(res, "Plan not found");
            }

            // Check if the plan being deleted is a default plan
            if (plan.is_default) {
                return responseHandler.error(
                    res,
                    "Cannot delete a default plan. Please set another plan as default first before deleting this plan."
                );
            }

            await plan.destroy();
            return responseHandler.success(res, "Plan deleted successfully", plan);
        } catch (error) {
            return responseHandler.error(res, error?.message);
        }
    }
}; 