import Joi from "joi";
import BillDebitnote from "../../models/billdebitnoteModel.js";
import Bill from "../../models/billModel.js";
import Setting from "../../models/settingModel.js";
import validator from "../../utils/validator.js";
import responseHandler from "../../utils/responseHandler.js";
import { Op } from "sequelize";

export default {
  validator: validator({
    params: Joi.object({
      id: Joi.string().required(),
    }),
  }),
  handler: async (req, res) => {
    try {
      const { id } = req.params;

      // Find the debit note
      const billDebitnote = await BillDebitnote.findOne({
        where: {
          id,
          client_id: req.des?.client_id,
        },
      });

      if (!billDebitnote) {
        return responseHandler.error(res, "BillDebitnote not found");
      }

      // Find associated bill
      const billData = await Bill.findOne({
        where: {
          id: billDebitnote.bill,
          client_id: req.des?.client_id,
        },
      });

      if (!billData) {
        return responseHandler.error(res, "Associated bill not found");
      }

      // Get all other debit notes for this bill
      const otherDebitNotes = await BillDebitnote.findAll({
        where: {
          bill: billDebitnote.bill,
          id: { [Op.ne]: id },
          client_id: req.des?.client_id,
        },
      });

      // Calculate new amounts
      const totalDebitedAmount = otherDebitNotes.reduce(
        (sum, note) => sum + note.amount,
        0
      );
      const newAmount = billData.amount + billDebitnote.amount;

      // Determine new payment status
      let newPaymentStatus = "unpaid";
      if (totalDebitedAmount >= billData.total) {
        newPaymentStatus = "paid";
      } else if (totalDebitedAmount > 0) {
        newPaymentStatus = "partially_paid";
      }

      // Get settings for UPI link
      const settings = await Setting.findOne({
        where: { client_id: req.des?.client_id },
      });

      // Update bill with new amount and status
      await billData.update({
        amount: newAmount,
        status: newPaymentStatus,
        upiLink: `upi://pay?pa=${settings?.merchant_upi_id || ""}&pn=${
          settings?.merchant_name || ""
        }&am=${newAmount}&cu=INR`,
        updated_by: req.user?.username,
      });

      // Store debit note data before deleting
      const deletedDebitNote = { ...billDebitnote.toJSON() };
      const previousBillStatus = billData.status;

      // Delete the debit note
      await billDebitnote.destroy();

      return responseHandler.success(
        res,
        "BillDebitnote deleted successfully",
        {
          deletedDebitNote,
          updatedBill: {
            id: billData.id,
            previousAmount: billData.amount - billDebitnote.amount,
            newAmount: newAmount,
            debitNoteAmount: billDebitnote.amount,
            remainingDebitedAmount: totalDebitedAmount,
            previousStatus: previousBillStatus,
            newStatus: newPaymentStatus,
          },
        }
      );
    } catch (error) {
      return responseHandler.error(res, error?.message);
    }
  },
};
