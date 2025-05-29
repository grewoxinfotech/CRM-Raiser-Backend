import CompanyAccount from "../../models/companyAccountModel.js";
import responseHandler from "../../utils/responseHandler.js";
import Joi from "joi";
import validator from "../../utils/validator.js";
import Notification from "../../models/notificationModel.js";

export default {
    validator: validator({
        body: Joi.object({
            account_owner: Joi.string().required(),
            company_name: Joi.string().required(),
            email: Joi.string().optional().allow('', null),
            company_source: Joi.string().optional().allow('', null),
            company_number: Joi.string().optional().allow('', null),
            company_type: Joi.string().optional().allow('', null),
            company_category: Joi.string().optional().allow('', null),
            company_revenue: Joi.string().optional().allow('', null),
            phone_code: Joi.string().optional().allow('', null),
            phone_number: Joi.string().optional().allow('', null),
            website: Joi.string().optional().allow('', null),
            billing_address: Joi.string().optional().allow('', null),
            billing_city: Joi.string().optional().allow('', null),
            billing_state: Joi.string().optional().allow('', null),
            billing_pincode: Joi.string().optional().allow('', null),
            billing_country: Joi.string().optional().allow('', null),
            shipping_address: Joi.string().optional().allow('', null),
            shipping_city: Joi.string().optional().allow('', null),
            shipping_state: Joi.string().optional().allow('', null),
            shipping_pincode: Joi.string().optional().allow('', null),
            shipping_country: Joi.string().optional().allow('', null),
            description: Joi.string().optional().allow('', null),
        })
    }),

    handler: async (req, res) => {
        try {
            const {
                account_owner,
                company_name,
                company_number,
                company_source,
                company_type,
                company_category,
                email,
                company_revenue,
                phone_code,
                phone_number,
                website,
                billing_address,
                billing_city,
                billing_state,
                billing_pincode,
                billing_country,
                shipping_address,
                shipping_city,
                shipping_state,
                shipping_pincode,
                shipping_country,
                description
            } = req.body;

            // Check if company account with same name exists
            const existingAccount = await CompanyAccount.findOne({
                where: {
                    company_name,
                    client_id: req.des?.client_id
                }
            });

            if (existingAccount) {
                return responseHandler.conflict(res, "Company account with this name already exists!");
            }

            // Create company account
            const companyAccount = await CompanyAccount.create({
                account_owner,
                company_name,
                company_number,
                email,
                company_source,
                company_type,
                company_category,
                company_revenue,
                phone_code,
                phone_number,
                website,
                billing_address,
                billing_city,
                billing_state,
                billing_pincode,
                billing_country,
                shipping_address,
                shipping_city,
                shipping_state,
                shipping_pincode,
                shipping_country,
                description,
                client_id: req.des?.client_id,
                created_by: req.user?.username
            });

            // Create notification
            await Notification.create({
                related_id: req.user?.id,
                users: [account_owner], // Send notification to account owner
                title: "New Company Account Added",
                from: req.user?.id,
                client_id: req.des?.client_id,
                message: `A new company account "${company_name}" has been added`,
                description: `Company Account Details:\n• Type: ${company_type}\n• \n• Category: ${company_category}`,
                created_by: req.user?.username,
            });

            return responseHandler.success(res, "Company account created successfully!", companyAccount);
        } catch (error) {
            return responseHandler.error(res, error?.message);
        }
    }
}; 