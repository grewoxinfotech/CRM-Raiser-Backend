import Joi from "joi";
import SalesQuotations from "../../models/salesQuotationModel.js";
import validator from "../../utils/validator.js";
import responseHandler from "../../utils/responseHandler.js";

export default {
    validator: validator({
        body: Joi.object({
            customer: Joi.string().required(),
            issueDate: Joi.date().required(),
            category: Joi.string().required(),
            items: Joi.object().required(),
            discount: Joi.number().optional(),
            tax: Joi.number().optional(),
            total: Joi.number().required()
        })
    }),
    handler: async (req, res) => {
        try {
            const { id } = req.user;
            const { customer, issueDate, category, items, discount, tax, total } = req.body;
            const existingSalesQuotation = await SalesQuotations.findOne({ where: { related_id: id, customer, issueDate, category, items, discount, tax, total } });
            if (existingSalesQuotation) {
                return responseHandler.error(res, "SalesQuotation already exists");
            }
            const salesQuotation = await SalesQuotations.create({ related_id: id, customer, issueDate, category, items, discount, tax, total,
                client_id: req.des?.client_id,
                created_by: req.user?.username });
            return responseHandler.success(res, "SalesQuotation created successfully", salesQuotation);
        } catch (error) {
            return responseHandler.error(res, error?.message);
        }
    }
}   