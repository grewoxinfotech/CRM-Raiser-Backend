import Joi from "joi";
import Proposal from "../../models/proposalModel.js";
import validator from "../../utils/validator.js";
import responseHandler from "../../utils/responseHandler.js";
import { Op } from "sequelize";

export default {
    validator: validator({
        params: Joi.object({
            id: Joi.string().required()
        }),
        body: Joi.object({
            lead_title: Joi.string().required(),
            // deal_title: Joi.string().required(),
            valid_till: Joi.date().required(),
            currency: Joi.string().required(),
            // calculatedTax: Joi.number().required(),
            description: Joi.string().required(),
            items: Joi.object().required(),
            subtotal: Joi.number().required(),
            discount: Joi.number().optional(),
            tax: Joi.number().optional(),
            total: Joi.number().required()
        })
    }),
    handler: async (req, res) => {
        try {
            const { id } = req.params;
            const { lead_title, valid_till, currency, description, items, discount, tax, total, subtotal } = req.body;
            const proposal = await Proposal.findByPk(id);
            if (!proposal) {
                return responseHandler.notFound(res, "Proposal not found");
            }
            const existingProposal = await Proposal.findOne({ where: { lead_title, valid_till, currency, description, items, discount, tax, total, subtotal, id: { [Op.not]: id } } });
            if (existingProposal) {
                return responseHandler.error(res, "Proposal already exists");
            }
            await proposal.update({ lead_title,  valid_till, currency, description, items, discount, tax, total, subtotal, updated_by: req.user?.username });
            return responseHandler.success(res, "Proposal updated successfully", proposal);
        } catch (error) {
            return responseHandler.error(res, error?.message);
        }
    }
}