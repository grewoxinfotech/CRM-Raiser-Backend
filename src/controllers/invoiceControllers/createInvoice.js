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
            customer: Joi.string().required(),
            issueDate: Joi.date().required(),
            dueDate: Joi.date().required(),
            currency: Joi.string().required(),
            items: Joi.object().required(), 
            status: Joi.string().optional().allow("", null),
            subtotal: Joi.number().required(),  
            discount: Joi.number().optional().allow("", null),
            total_discount: Joi.number().optional().allow("", null),
            tax: Joi.number().optional().allow("", null),
            total: Joi.number().required()
        })
    }),
    handler: async (req, res) => {
        try {
            const { id } = req.params;
            const { issueDate, dueDate, currency, client, project, customer, items, discount, tax, total, subtotal, status, total_discount} = req.body;
            const invoice = await Invoice.create({ related_id: id, issueDate, dueDate, currency, client, project, customer, items, discount, tax, total, subtotal, status, total_discount,
                client_id: req.des?.client_id,
                created_by: req.user?.username });
            return responseHandler.success(res, "Invoice created successfully", invoice);
        } catch (error) {
            return responseHandler.error(res, error?.message);
        }
    }
}   