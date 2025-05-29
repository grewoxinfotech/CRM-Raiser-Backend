import Joi from "joi";
import Payment from "../../models/paymentModel.js";
import SalesInvoice from "../../models/salesInvoiceModel.js";
import SalesRevenue from "../../models/salesRevenueModel.js";
import Product from "../../models/productModel.js";
import Activity from "../../models/activityModel.js";
import validator from "../../utils/validator.js";
import responseHandler from "../../utils/responseHandler.js";
import { s3 } from "../../config/config.js";

export default {
  validator: validator({
    params: Joi.object({
      id: Joi.string().required(),
    }),
  }),
  handler: async (req, res) => {
    try {
      const { id } = req.params;

      // Find payment with items
      const payment = await Payment.findByPk(id);
      if (!payment) {
        return responseHandler.error(res, "Payment not found", 404);
      }

      // Find related invoice
      const invoice = await SalesInvoice.findByPk(payment.invoice);
      if (!invoice) {
        return responseHandler.error(res, "Related invoice not found", 404);
      }

      // Get all payments for this invoice
      const allPayments = await Payment.findAll({
        where: { invoice: payment.invoice },
      });

      // Calculate new total paid amount excluding current payment
      const newTotalPaid = allPayments
        .filter((p) => p.id !== payment.id)
        .reduce((sum, p) => sum + Number(p.amount), 0);

      // Determine new payment status
      let newPaymentStatus = "unpaid";
      if (newTotalPaid >= invoice.total) {
        newPaymentStatus = "paid";
      } else if (newTotalPaid > 0) {
        newPaymentStatus = "partially_paid";
      }

      // Update product stock based on invoice items
      if (invoice.items) {
        const invoiceItems =
          typeof invoice.items === "string"
            ? JSON.parse(invoice.items)
            : invoice.items;

        for (const item of invoiceItems) {
          const product = await Product.findByPk(item.product_id);
          if (!product) {
            continue;
          }

          const oldStock = product.stock_quantity;
          const addBackQuantity = Number(item.quantity);
          const newStock = oldStock + addBackQuantity;

          // Update product stock
          await product.update({
            stock_quantity: newStock,
            updated_by: req.user?.username,
          });

          // Log stock update activity
          await Activity.create({
            related_id: payment.related_id,
            activity_from: "product",
            activity_id: product.id,
            action: "stock_updated",
            performed_by: req.user?.username,
            client_id: req.des?.client_id,
            activity_message: `Product stock updated from ${oldStock} to ${newStock} (${addBackQuantity} units added back) due to payment deletion for invoice #${invoice.id}`,
          });
        }
      } else {
      }

      // Delete associated revenue entry

      const deletedRevenue = await SalesRevenue.destroy({
        where: {
          related_id: payment.related_id,
          account: "sales_payment",
          amount: payment.amount,
          date: payment.paidOn,
        },
      });

      // Update invoice status and amount
      await invoice.update({
        amount: invoice.total - newTotalPaid,
        payment_status: newPaymentStatus,
      });

      // Delete receipt from S3 if exists
      if (payment.receipt) {
        const key = decodeURIComponent(payment.receipt.split(".com/").pop());
        const s3Params = {
          Bucket: s3.config.bucketName,
          Key: key,
        };
        await s3.deleteObject(s3Params).promise();
      }

      // Delete the payment
      await payment.destroy();

      // Log activity
      await Activity.create({
        related_id: payment.related_id,
        activity_from: "payment",
        activity_id: payment.id,
        action: "deleted",
        performed_by: req.user?.username,
        client_id: req.des?.client_id,
        activity_message: `Payment of ${payment.amount} ${payment.currency} deleted for invoice #${payment.invoice}. Invoice status updated to: ${newPaymentStatus}`,
      });

      return responseHandler.success(res, "Payment deleted successfully", {
        deletedPayment: payment,
        updatedInvoice: {
          id: invoice.id,
          newAmount: invoice.total - newTotalPaid,
          newStatus: newPaymentStatus,
        },
      });
    } catch (error) {
      console.error("[Payment Delete] Error occurred:", error);
      console.error("[Payment Delete] Error stack:", error.stack);
      return responseHandler.error(res, error?.message);
    }
  },
};
