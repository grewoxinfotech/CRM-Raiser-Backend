import Joi from "joi";
import Invoice from "../../models/invoiceModel.js";
import validator from "../../utils/validator.js";
import responseHandler from "../../utils/responseHandler.js";

export default {
    validator: validator({
        params: Joi.object({
            id: Joi.string().required()
        }),
        body: Joi.object({
            project: Joi.string().optional().allow("", null),
            client: Joi.string().optional().allow("", null),
            issueDate: Joi.date().optional().allow("", null),
            dueDate: Joi.date().optional().allow("", null),
            customer: Joi.string().optional().allow("", null),
            subtotal: Joi.number().optional().allow("", null),
            currency: Joi.string().optional().allow("", null),
            items: Joi.object().optional().allow("", null),  
            discount: Joi.number().optional().allow("", null),
            total_discount: Joi.number().optional().allow("", null),
            tax: Joi.number().optional().allow("", null),
            total: Joi.number().optional().allow("", null),
            status: Joi.string().optional().allow("", null)
        })
    }),
    handler: async (req, res) => {
        try {
            const { id } = req.params;
            const { issueDate, dueDate, currency, client, project, customer, items, discount, tax, total, subtotal, status, total_discount } = req.body;

            const invoice = await Invoice.findByPk(id);
            if (!invoice) {
                return responseHandler.error(res, "Invoice not found");
            }
            await invoice.update({ issueDate, dueDate, currency, client, project, customer, items, discount, tax, total, subtotal, status, total_discount, updated_by: req.user?.username });
            return responseHandler.success(res, "Invoice updated successfully", invoice);
        } catch (error) {
            return responseHandler.error(res, error?.message);
        }
    }
}