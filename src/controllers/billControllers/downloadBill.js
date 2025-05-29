import Joi from 'joi';
import responseHandler from '../../utils/responseHandler.js';
import Bill from '../../models/billModel.js';
import User from '../../models/userModel.js';
import SubscriptionPlan from '../../models/subscriptionPlanModel.js';
import ClientSubscription from '../../models/clientSubscriptionModel.js';
import { generateBillPDF } from '../../utils/pdfGenerator.js';
import validator from '../../utils/validator.js';

export default {
    validator: validator({
        params: Joi.object({
            id: Joi.string().required()
        })
    }),
    handler: async (req, res) => {
        try {
            const { id } = req.params;

            // Get bill details
            const bill = await Bill.findOne({ where: { id } });
            if (!bill) {
                return responseHandler.notFound(res, 'Bill not found');
            }

            // Get subscription details
            const subscription = await ClientSubscription.findByPk(bill.related_id);
            if (!subscription) {
                return responseHandler.notFound(res, 'Subscription not found');
            }

            // Get client details
            const client = await User.findByPk(subscription.client_id);
            if (!client) {
                return responseHandler.notFound(res, 'Client not found');
            }

            // Get plan details
            const plan = await SubscriptionPlan.findByPk(subscription.plan_id);
            if (!plan) {
                return responseHandler.notFound(res, 'Plan not found');
            }

            // Generate and stream PDF
            await generateBillPDF(client, plan, subscription, bill, res);
        } catch (error) {
            return responseHandler.error(res, error?.message);
        }
    }
};
