import Joi from "joi";
import Quotations from "../../models/quotationModel.js";
import validator from "../../utils/validator.js";
import responseHandler from "../../utils/responseHandler.js";
import { Op } from "sequelize";

export default {
    validator: validator({
        params: Joi.object({
            id: Joi.string().required()
        }),
        body: Joi.object({
            valid_till: Joi.date().required(),
            currency: Joi.string().required(),
            lead: Joi.string().required(),
            // client: Joi.string().required().optional(),
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
            const quotations = await Quotations.findByPk(id);
            if (!quotations) {
                return responseHandler.error(res, "Quotation not found");
            }
            const existingQuotation = await Quotations.findOne({ where: { related_id: id, valid_till, currency, lead, calculatedTax, items, discount, tax, total, id: { [Op.not]: id } } });
            if (existingQuotation) {
                return responseHandler.error(res, "Quotation already exists");
            }
            await quotations.update({ valid_till, currency, lead, calculatedTax, items, discount, tax, total, updated_by: req.user?.username });
            return responseHandler.success(res, "Quotation updated successfully", quotations);
        } catch (error) {
            return responseHandler.error(res, error?.message);
        }
    }
}   