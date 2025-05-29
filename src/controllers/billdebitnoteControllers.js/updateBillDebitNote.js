import Joi from "joi";
import BillDebitnote from "../../models/billdebitnoteModel.js";
import validator from "../../utils/validator.js";
import responseHandler from "../../utils/responseHandler.js";
import Bill from "../../models/billModel.js";

export default {
    validator: validator({
        params: Joi.object({
            id: Joi.string().required()
        }),
        body: Joi.object({
            invoice: Joi.string().optional(),
            date: Joi.date().required(),
            currency: Joi.string().optional(),
            amount: Joi.number().required(),
            description: Joi.string().optional().allow('', null),
        })
    }),
    handler: async (req, res) => {
        try {
            const { id } = req.params;
            const { bill, date, amount, description, currency } = req.body;

            const billl = await Bill.findByPk(bill);
            if (!billl) {
                return responseHandler.error(res, "Bill not found");
            }

            // Check if credit amount is valid
            if (amount > billl.total) {
                return responseHandler.error(res, "Credit amount cannot be greater than invoice total");
            }

            const billDebitnote = await BillDebitnote.findByPk(id);
            if (!billDebitnote) {
                return responseHandler.error(res, "BillDebitnote not found");
            }
            await billDebitnote.update({ bill, date, amount, description, currency, updated_by: req.user?.username });

            const updatedTotal = billl.total - amount;
            await billl.update({ total: updatedTotal });

            return responseHandler.success(res, "BillDebitnote updated successfully", billDebitnote);
        } catch (error) {
            return responseHandler.error(res, error?.message);
        }
    }
}