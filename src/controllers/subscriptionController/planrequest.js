import Joi from "joi";
import validator from "../../utils/validator.js";
import ClientSubscription from "../../models/clientSubscriptionModel.js";
import SubscriptionPlan from "../../models/subscriptionPlanModel.js";
import responseHandler from "../../utils/responseHandler.js";
import User from "../../models/userModel.js";
import { getPlanBuyEmailTemplate } from "../../utils/emailTemplates.js";
import Bill from "../../models/billModel.js";
import { CLIENT_URL, EMAIL_FROM } from "../../config/config.js";
import sgMail from "../../utils/emailService.js";

export default {
    validator: validator({
        body: Joi.object({
            plan_id: Joi.string().required(),
            client_id: Joi.string().required(),
            start_date: Joi.date().required(),
            end_date: Joi.date().required(),
            payment_status: Joi.string().valid('paid', 'unpaid').default('unpaid')
        })
    }),
    handler: async (req, res) => {
        try {
            const { plan_id, payment_status, client_id, start_date, end_date } = req.body;

            // Get the plan details
            const plan = await SubscriptionPlan.findByPk(plan_id);
            if (!plan) {
                return responseHandler.notFound(res, "Subscription plan not found");
            }

            // Check for existing subscription
            const existingSubscription = await ClientSubscription.findOne({
                where: {
                    client_id
                }
            });

            // Handle start and end times
            const currentDate = new Date();
            let startDateTime = new Date(start_date);
            let endDateTime = new Date(end_date);

            // If start date is today, use current time
            if (startDateTime.toDateString() === currentDate.toDateString()) {
                startDateTime = currentDate;
            } else {
                // If different date, set time to 12:00 AM
                startDateTime.setHours(0, 0, 0, 0);
            }

            // Set end time based on start time
            endDateTime.setHours(startDateTime.getHours(), startDateTime.getMinutes(), startDateTime.getSeconds(), startDateTime.getMilliseconds());

            // Calculate trial period if new client
            if (!existingSubscription && plan.trial_period) {
                const trialDays = parseInt(plan.trial_period);
                endDateTime = new Date(startDateTime);
                endDateTime.setDate(endDateTime.getDate() + trialDays);
            }

            let subscription;
            if (existingSubscription) {
                // Update existing subscription
                subscription = await existingSubscription.update({
                    plan_id,
                    start_date: start_date,
                    end_date: end_date,
                    start_time: startDateTime,
                    end_time: endDateTime,
                    status: 'active',
                    current_storage_used: 0,
                    current_users_count: 0,
                    current_clients_count: 0,
                    payment_status: payment_status,
                    last_payment_date: new Date(),
                    updated_by: req.user?.username
                });
            } else {
                // Create new subscription
                subscription = await ClientSubscription.create({
                    client_id,
                    plan_id,
                    start_date: start_date,
                    end_date: end_date,
                    start_time: startDateTime,
                    end_time: endDateTime,
                    status: 'active',
                    current_users_count: 0,
                    current_clients_count: 0,
                    current_storage_used: 0,
                    payment_status: payment_status,
                    last_payment_date: new Date(),
                    created_by: req.user?.username
                });
            }

            const client = await User.findByPk(client_id);

            // Create bill
            let bill;
            try {
                bill = await Bill.create({
                    related_id: subscription.id,
                    vendor: client_id,
                    billDate: new Date(),
                    discription: "Please pay bill",
                    status: payment_status,
                    discount: 0,
                    tax: 0,
                    total: parseFloat(plan.price),
                    note: "Thank you for subscribing to our service",
                    client_id: client_id,
                    created_by: req.user?.username
                });
            } catch (billError) {
                console.error("Bill creation error:", {
                    error: billError.message,
                    stack: billError.stack,
                    validationErrors: billError.errors
                });
                await subscription.destroy();
                throw new Error(`Failed to create bill: ${billError.message}`);
            }

            const billUrl = `${CLIENT_URL}/api/v1/bills/download/${bill.id}`;

            // Send confirmation email
            const emailTemplate = getPlanBuyEmailTemplate(client.username, plan, billUrl);
            await sgMail.send({
                to: client.email,
                from: EMAIL_FROM,
                subject: 'Plan Purchase Confirmation',
                html: emailTemplate
            });

            const message = existingSubscription ?
                "Subscription plan updated successfully" :
                "Subscription plan request processed successfully";

            return responseHandler.created(res, message, subscription);
        } catch (error) {
            return responseHandler.error(res, error?.message);
        }
    }
};
