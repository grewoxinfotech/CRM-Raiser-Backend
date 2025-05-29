import Joi from "joi";
import BillDebitnote from "../../models/billdebitnoteModel.js";
import Bill from "../../models/billModel.js";
import validator from "../../utils/validator.js";
import responseHandler from "../../utils/responseHandler.js";
import Setting from "../../models/settingModel.js";

export default {
    validator: validator({
        body: Joi.object({
            bill: Joi.string().required(),
            date: Joi.date().required(), 
            currency: Joi.string().optional(),
            amount: Joi.number().required(),
            description: Joi.string().optional().allow('', null),
        })
    }),
    handler: async (req, res) => {
        try {
            const { bill, date, amount, description, currency } = req.body;

            // Find the bill in bill model
            const billData = await Bill.findOne({ 
                where: { 
                    id: bill,
                } 
            });
            
            if (!billData) {
                return responseHandler.error(res, "Bill not found");
            }

            // Get existing debit notes total for this bill
            const existingDebitNotes = await BillDebitnote.findAll({
                where: { bill }
            });
            const totalDebitedAmount = existingDebitNotes.reduce((sum, note) => sum + note.amount, 0);

            // Check if debit amount is valid (including existing debit notes)
            const remainingBillAmount = billData.amount;  // Changed to use current amount
            if (amount > remainingBillAmount) {
                return responseHandler.error(
                    res,
                    `Debit amount cannot be greater than remaining bill amount (${remainingBillAmount})`
                );
            }

            // Create debit note
            const billDebitnote = await BillDebitnote.create({ 
                bill, 
                date, 
                currency, 
                amount, 
                description, 
                client_id: req.des?.client_id,
                created_by: req.user?.username 
            });

            // Calculate new total and determine payment status
            const newTotal = billData.total;
            const newAmount = billData.amount - amount;
            const newTotalDebited = totalDebitedAmount + amount;

            let newPaymentStatus = billData.status;
            let shouldUpdateStock = false;

            // If new amount is 0 or total debited equals bill total, mark as paid
            if (newAmount === 0 || Math.abs(newTotalDebited - billData.total) < 0.01) {
                newPaymentStatus = 'paid';
                shouldUpdateStock = true;
            }
            // If some amount is remaining, mark as partially_paid
            else if (newAmount > 0) {
                newPaymentStatus = 'partially_paid';
            }

            const settings = await Setting.findOne({
                where: { client_id: req.des?.client_id }
              });

            // Update bill
            await billData.update({
                amount: newAmount,
                upiLink: `upi://pay?pa=${settings?.merchant_upi_id || ''}&pn=${settings?.merchant_name || ''}&am=${newAmount}&cu=INR`,
                status: newPaymentStatus
            });

            return responseHandler.success(res, "Bill Debit Note created successfully", {
                debitNote: billDebitnote,
                updatedBill: {
                    id: billData.id,
                    previousAmount: billData.amount,
                    newAmount: newAmount,
                    debitedAmount: amount,
                    totalDebitedAmount: newTotalDebited,
                    previousStatus: billData.status,
                    newStatus: newPaymentStatus,
                    stockUpdated: shouldUpdateStock
                }
            });
        } catch (error) {
            return responseHandler.error(res, error?.message);
        }
    }
}