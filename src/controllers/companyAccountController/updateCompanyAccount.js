import Joi from "joi";
import CompanyAccount from "../../models/companyAccountModel.js";
import responseHandler from "../../utils/responseHandler.js";
import validator from "../../utils/validator.js";
import { Op } from "sequelize";

export default {
    validator: validator({
        params: Joi.object({
            id: Joi.string().required(),
        }),
        body: Joi.object({
            account_owner: Joi.string().required(),
            company_name: Joi.string().required(),
            email: Joi.string().optional().allow('', null),
            company_number: Joi.string().optional().allow('', null),
            company_source: Joi.string().optional().allow('', null),
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
            const { id } = req.params;
            const { account_owner, company_name, company_number,email,company_source, company_type, company_category, company_revenue, phone_code, phone_number, website, billing_address, billing_city, billing_state, billing_pincode, billing_country, shipping_address, shipping_city, shipping_state, shipping_pincode, shipping_country, description } = req.body;

            const companyAccount = await CompanyAccount.findByPk(id);
            if (!companyAccount) {
                return responseHandler.error(res, "Company Account not found");
            }

            const existingCompanyAccount = await CompanyAccount.findOne({ where: { company_name, id: { [Op.not]: id } } });
            if (existingCompanyAccount) {
                return responseHandler.error(res, "Company Account already exists");
            }

            await companyAccount.update({ account_owner, company_name,email, company_number, company_source, company_type, company_category, company_revenue, phone_code, phone_number, website, billing_address, billing_city, billing_state, billing_pincode, billing_country, shipping_address, shipping_city, shipping_state, shipping_pincode, shipping_country, description, updated_by: req.user?.username });
            return responseHandler.success(res, "Company Account updated successfully", companyAccount);
        } catch (error) {
            return responseHandler.error(res, error?.message);
        }
    }
}
