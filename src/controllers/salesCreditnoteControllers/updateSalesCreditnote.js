import Joi from "joi";
import SalesCreditnote from "../../models/salesCreditnoteModel.js";
import validator from "../../utils/validator.js";
import responseHandler from "../../utils/responseHandler.js";
import SalesInvoice from "../../models/salesInvoiceModel.js";

export default {
  validator: validator({
    params: Joi.object({
      id: Joi.string().required(),
    }),
    body: Joi.object({
      invoice: Joi.string().optional(),
      date: Joi.date().optional(),
      currency: Joi.string().optional(),
      amount: Joi.number().optional(),
      description: Joi.string().optional().allow("", null),
    }),
  }),
  handler: async (req, res) => {
    try {
      const { id } = req.params;
      const { invoice, date, currency, amount, description } = req.body;

      const salesInvoice = await SalesInvoice.findByPk(invoice);
      if (!salesInvoice) {
        return responseHandler.error(res, "Sales Invoice not found");
      }

      // Check if credit amount is valid
      if (amount > salesInvoice.total) {
        return responseHandler.error(
          res,
          "Credit amount cannot be greater than invoice total"
        );
      }

      const salesCreditnote = await SalesCreditnote.findByPk(id);
      if (!salesCreditnote) {
        return responseHandler.error(res, "SalesCreditnote not found");
      }
      await salesCreditnote.update({
        invoice,
        date,
        currency,
        amount,
        description,
        updated_by: req.user?.username,
      });

      const updatedTotal = salesInvoice.total - amount;
      await salesInvoice.update({ total: updatedTotal });

      return responseHandler.success(
        res,
        "SalesCreditnote updated successfully",
        salesCreditnote
      );
    } catch (error) {
      return responseHandler.error(res, error?.message);
    }
  },
};
