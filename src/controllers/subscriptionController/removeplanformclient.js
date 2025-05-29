import Joi from "joi";
import validator from "../../utils/validator.js";
import ClientSubscription from "../../models/clientSubscriptionModel.js";
import responseHandler from "../../utils/responseHandler.js";
import User from "../../models/userModel.js";

export default {
    validator: validator({
        params: Joi.object({
            id: Joi.string().required()
        })
    }),
    handler: async (req, res) => {
        try {
            const { id } = req.params;

            const existingSubscription = await ClientSubscription.findByPk(id);

            if (!existingSubscription) {
                return responseHandler.error(res, "Subscription not found");
            }

            // Update subscription status to inactive and remove plan_id
            await existingSubscription.update({
                status: 'cancelled',
                // plan_id: null,
                updated_by: req.user?.username
            });

            // Remove plan_id from user
            // await User.update({
            //     client_plan_id: null
            // }, {
            //     where: {
            //         id: existingSubscription.client_id
            //     }
            // });

            return responseHandler.success(res, "Subscription plan removed successfully");
        } catch (error) {
            return responseHandler.error(res, error?.message);
        }
    }
};
