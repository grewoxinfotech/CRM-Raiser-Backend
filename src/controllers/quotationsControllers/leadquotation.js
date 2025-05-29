import Joi from "joi";
import Quotations from "../../models/quotationModel.js";
import validator from "../../utils/validator.js";
import responseHandler from "../../utils/responseHandler.js";

export default {
    validator: validator({
        params: Joi.object({
            id: Joi.string().required()
        }),
        body: Joi.object({
            valid_till: Joi.date().required(),
            currency: Joi.string().required(),
            lead: Joi.string().required(),
            // client: Joi.string().required(),
            calculatedTax: Joi.number().required(),
            items: Joi.object().required(),
            discount: Joi.number().optional(),
            tax: Joi.number().optional(),
            total: Joi.number().required()
        })
    }),
    handler: async (req, res) => {
        try {
            const { id } = req.params;
            const { valid_till, currency, lead, calculatedTax, items, discount, tax, total } = req.body;
            const existingQuotation = await Quotations.findOne({ where: { related_id: id, valid_till, currency, lead, calculatedTax, items, discount, tax, total } });
            if (existingQuotation) {
                return responseHandler.error(res, "Quotation already exists");
            }
            const quotation = await Quotations.create({ related_id: id, valid_till, currency, lead, calculatedTax, items, discount, tax, total, created_by: req.user?.username });
            return responseHandler.success(res, "Quotation created successfully", quotation);
        } catch (error) {
            return responseHandler.error(res, error?.message);
        }
    }
}   