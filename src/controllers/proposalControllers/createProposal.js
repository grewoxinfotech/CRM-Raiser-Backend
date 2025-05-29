import Joi from "joi";
import Proposal from "../../models/proposalModel.js";
import validator from "../../utils/validator.js";
import responseHandler from "../../utils/responseHandler.js";

export default {
    validator: validator({
        body: Joi.object({
            lead_title: Joi.string().required(),
            // deal_title: Joi.string().required(),
            valid_till: Joi.date().required(),
            currency: Joi.string().required(),
            // calculatedTax: Joi.number().required(),
            description: Joi.string().required(),
            items: Joi.object().required(),
            discount: Joi.number().optional(),
            tax: Joi.number().optional(),
            total: Joi.number().required(),
            subtotal: Joi.number().required(),
        })
    }),
    handler: async (req, res) => {
        try {
            const { lead_title, valid_till, currency, description, items, discount, tax, total,subtotal } = req.body;
            const existingProposal = await Proposal.findOne({ where: { lead_title, valid_till, currency, description, items, discount, tax, total,subtotal } });
            if (existingProposal) {
                return responseHandler.error(res, "Proposal already exists");
            }
            const proposal = await Proposal.create({
                lead_title, valid_till, currency, description,
                items, discount, tax, total,subtotal,
                client_id: req.des?.client_id,
                created_by: req.user?.username
            });
            return responseHandler.success(res, "Proposal created successfully", proposal);
        } catch (error) {
            return responseHandler.error(res, error?.message);
        }
    }
}