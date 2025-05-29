import Joi from "joi";
import validator from "../../utils/validator.js";
import ClientSubscription from "../../models/clientSubscriptionModel.js";
import SubscriptionPlan from "../../models/subscriptionPlanModel.js";
import responseHandler from "../../utils/responseHandler.js";
import Bill from "../../models/billModel.js";
import { getPlanBuyEmailTemplate } from "../../utils/emailTemplates.js";
import User from "../../models/userModel.js";
import { sendEmail } from "../../utils/emailService.js";
import { CLIENT_URL } from "../../config/config.js";

export default {
    validator: validator({
        body: Joi.object({
            client_id: Joi.string().required(),
            plan_id: Joi.string().required(),
            start_date: Joi.date().required(),
            end_date: Joi.date().optional(),
            status: Joi.string().valid('active', 'trial').required(),
            payment_status: Joi.string().valid('paid', 'unpaid').default('unpaid')
        })
    }),
    handler: async (req, res) => {
        try {
            const { client_id, plan_id, start_date, end_date, status, payment_status } = req.body;


            let bill;

            const plan = await SubscriptionPlan.findByPk(plan_id);
            if (!plan) {
                return responseHandler.notFound(res, "Subscription plan not found");
            }



            // First check for existing subscription
            const existingSubscription = await ClientSubscription.findOne({
                where: {
                    client_id,

                }
            });

            if (existingSubscription) {
                return responseHandler.error(res, "Client already has an active subscription");
            }

            // Check for previous subscriptions (including expired ones)
            const previousSubscription = await ClientSubscription.findOne({
                where: { client_id }
            });



            // Handle start and end times
            const currentDate = new Date();
            let startDateTime = new Date(start_date);
            let endDateTime = end_date ? new Date(end_date) : null;

            // If start date is today, use current time
            if (startDateTime.toDateString() === currentDate.toDateString()) {
                startDateTime = currentDate;
            } else {
                startDateTime.setHours(0, 0, 0, 0);
            }

            // Handle end date and trial period
            if (!previousSubscription && plan.trial_period) {
                // New client with no previous subscriptions - apply trial period
                const trialDays = parseInt(plan.trial_period);


                if (endDateTime) {
                    // Add trial days to provided end date
                    endDateTime = new Date(end_date);
                    endDateTime.setDate(endDateTime.getDate() + trialDays);
                } else {
                    // Create end date from start date + trial days
                    endDateTime = new Date(startDateTime);
                    endDateTime.setDate(endDateTime.getDate() + trialDays);
                }
                endDateTime.setHours(23, 59, 59, 999);

                // Force status to trial for new clients
                // if (status !== 'trial') {
                //     status = 'trial';
                // }
            } else if (endDateTime) {
                // Existing client or no trial period - use provided end date
                endDateTime.setHours(23, 59, 59, 999);
            }



            // Create subscription with final dates
            const subscription = await ClientSubscription.create({
                client_id,
                plan_id,
                start_time: startDateTime,
                end_time: endDateTime,
                start_date,
                end_date: endDateTime,
                status,
                current_users_count: 0,
                current_clients_count: 0,
                current_storage_used: 0,
                payment_status,
                created_by: req.user?.username
            });

            await User.update({
                client_plan_id: subscription.id
            }, {
                where: {
                    id: client_id
                }
            });

            // const planPrice = plan.price;

            // const client = await User.findByPk(client_id);



            // try {
            //     bill = await Bill.create({
            //         related_id: subscription.id,
            //         vendor: client_id,
            //         billDate: new Date(),
            //         discription: "pls pay bill",
            //         status: payment_status,
            //         items: 0,
            //         discount: 0,
            //         tax: 0,
            //         subTotal: parseFloat(planPrice),

            //         total: parseFloat(planPrice),
            //         note: "Thank you for subscribing to our service",
            //         client_id: client_id,
            //         created_by: req.user?.username
            //     });


            // } catch (billError) {
            //     console.error("Bill creation error:", {
            //         error: billError.message,
            //         stack: billError.stack,
            //         validationErrors: billError.errors
            //     });
            //     await subscription.destroy();
            //     throw new Error(`Failed to create bill: ${billError.message}`);
            // }

            // const billUrl = `${CLIENT_URL}/api/v1/bills/download/${bill.id}`;


            // const emailTemplate = getPlanBuyEmailTemplate(client.username, plan, billUrl);
            // await sendEmail(
            //     client.email,
            //     'Plan Buy Confirmation',
            //     emailTemplate
            // );

            return responseHandler.created(res, "Subscription plan assigned successfully", subscription);
        } catch (error) {
            return responseHandler.error(res, error.message);
        }
    }
};






