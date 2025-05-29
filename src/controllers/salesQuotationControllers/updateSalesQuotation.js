import Joi from "joi";
import SalesQuotations from "../../models/salesQuotationModel.js";
import validator from "../../utils/validator.js";
import responseHandler from "../../utils/responseHandler.js";
import { Op } from "sequelize";

export default {
    validator: validator({
        params: Joi.object({
            id: Joi.string().required()
        }),
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
            const { id } = req.params;
            const { customer, issueDate, category, items, discount, tax, total } = req.body;
            const salesQuotation = await SalesQuotations.findByPk(id);
            if (!salesQuotation) {
                return responseHandler.error(res, "SalesQuotation not found");
            }
            const existingSalesQuotation = await SalesQuotations.findOne({ where: { related_id: id, customer, issueDate, category, items, discount, tax, total, id: { [Op.not]: id } } });
            if (existingSalesQuotation) {
                return responseHandler.error(res, "SalesQuotation already exists");
            }
            await salesQuotation.update({ customer, issueDate, category, items, discount, tax, total, updated_by: req.user?.username });
            return responseHandler.success(res, "SalesQuotation updated successfully", salesQuotation);
        } catch (error) {
            return responseHandler.error(res, error?.message);
        }
    }
}   