import responseHandler from "../utils/responseHandler.js";

export const checkFeatureAccess = (feature) => {
    return async (req, res, next) => {
        try {
            const subscription = req.subscription;
            const plan = subscription.SubscriptionPlan;

            if (!plan.features[feature]) {
                return responseHandler.forbidden(res,
                    `Your subscription plan doesn't include ${feature} feature`
                );
            }

            next();
        } catch (error) {
            return responseHandler.error(res, error?.message);
        }
    };
};

