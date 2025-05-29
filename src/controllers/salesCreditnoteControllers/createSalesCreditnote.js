import Joi from "joi";
import SalesCreditnote from "../../models/salesCreditnoteModel.js";
import SalesInvoice from "../../models/salesInvoiceModel.js";
import SalesRevenue from "../../models/salesRevenueModel.js";
import Product from "../../models/productModel.js";
import validator from "../../utils/validator.js";
import responseHandler from "../../utils/responseHandler.js";
import uploadToS3 from "../../utils/uploadToS3.js";
import Activity from "../../models/activityModel.js";
import Setting from "../../models/settingModel.js";

export default {
  validator: validator({
    body: Joi.object({
      invoice: Joi.string().required(),
      date: Joi.date().optional(),
      currency: Joi.string().optional(),
      amount: Joi.number().required(),
      description: Joi.string().optional().allow("", null),
    }),
  }),
  handler: async (req, res) => {
    try {
      const { id } = req.user;
      const { invoice, date, currency, amount, description } = req.body;

      // Find the related sales invoice
      const salesInvoice = await SalesInvoice.findByPk(invoice);
      if (!salesInvoice) {
        return responseHandler.error(res, "Sales Invoice not found");
      }

      // Get existing credit notes total for this invoice
      const existingCreditNotes = await SalesCreditnote.findAll({
        where: { invoice },
      });
      const totalCreditedAmount = existingCreditNotes.reduce(
        (sum, note) => sum + Number(note.amount),
        0
      );
      const newTotalCredited = totalCreditedAmount + Number(amount);

      // Check if credit amount is valid
      if (newTotalCredited > salesInvoice.total) {
        return responseHandler.error(
          res,
          `Total credited amount (${newTotalCredited}) cannot exceed invoice amount (${salesInvoice.total})`
        );
      }

      // Parse invoice items
      const invoiceItems =
        typeof salesInvoice.items === "string"
          ? JSON.parse(salesInvoice.items)
          : salesInvoice.items || [];

      // Check product stock availability before proceeding
      if (newTotalCredited >= salesInvoice.total) {
        // Only check stock if this credit note will complete the invoice
        for (const item of invoiceItems) {
          const product = await Product.findByPk(item.product_id);
          if (!product) {
            return responseHandler.error(
              res,
              `Product with ID ${item.product_id} not found`
            );
          }

          if (product.stock_quantity < item.quantity) {
            return responseHandler.error(
              res,
              `Insufficient stock for product ${product.name}. Available: ${product.stock_quantity}, Required: ${item.quantity}`
            );
          }
        }
      }

      // Handle file upload to S3
      let attachmentUrl = null;
      if (req.file) {
        attachmentUrl = await uploadToS3(
          req.file,
          "client",
          "creditnotes",
          req.user?.username
        );
      }

      // Calculate proportional amounts for each item based on credit note amount
      const creditNoteItems = await Promise.all(
        invoiceItems.map(async (item) => {
          // Get the product to access its profit margin
          const product = await Product.findByPk(item.product_id);
          if (!product) {
            throw new Error(`Product with ID ${item.product_id} not found`);
          }

          // Calculate credit amount for this item based on its proportion of total invoice
          const itemPercentage = item.total / salesInvoice.total;
          const itemCreditAmount = amount * itemPercentage;

          return {
            ...item,
            credit_amount: itemCreditAmount,
          };
        })
      );

      // Create credit note
      const salesCreditnote = await SalesCreditnote.create({
        related_id: id,
        invoice,
        date: date || new Date(),
        currency: currency || salesInvoice.currency,
        amount,
        description,
        items: JSON.stringify(creditNoteItems),
        attachment: attachmentUrl,
        client_id: req.des?.client_id,
        created_by: req.user?.username,
      });

      // Calculate new amount and determine payment status
      const newAmount = salesInvoice.amount - amount;
      let newPaymentStatus = salesInvoice.payment_status;
      let shouldCreateRevenue = false;
      let shouldUpdateStock = false;

      // If total credited equals invoice total, mark as paid
      if (Math.abs(newTotalCredited - salesInvoice.total) < 0.01) {
        newPaymentStatus = "paid";
        shouldCreateRevenue = true;
        shouldUpdateStock = true;
      }
      // If some amount is credited but not complete, mark as partially_paid
      else if (newTotalCredited > 0) {
        newPaymentStatus = "partially_paid";
      }

      const settings = await Setting.findOne({
        where: { client_id: req.des?.client_id },
      });

      // Update invoice amount
      await salesInvoice.update({
        amount: newAmount,
        upiLink: `upi://pay?pa=${settings?.merchant_upi_id || ""}&pn=${settings?.merchant_name || ""
          }&am=${newAmount}&cu=INR`,
        payment_status: newPaymentStatus,
      });

      // Update product stock if credit note completes the invoice
      if (shouldUpdateStock) {
        for (const item of invoiceItems) {
          const product = await Product.findByPk(item.product_id);
          if (product) {
            await product.update({
              stock_quantity: product.stock_quantity - item.quantity,
              updated_by: req.user?.username,
            });
          }
        }
      }

      // If this is the final credit note that completes the invoice, create revenue
      if (shouldCreateRevenue) {
        // Calculate revenue based on invoice total and total cost of goods
        const totalRevenue = salesInvoice.total;
        const totalCost = salesInvoice.cost_of_goods;
        const totalProfit = salesInvoice.profit;
        const profitPercentage = salesInvoice.profit_percentage;
        const invoiceNumber = salesInvoice.salesInvoiceNumber;
        // Create revenue entry with total profit from invoice
        await SalesRevenue.create({
          related_id: id,
          date: date || new Date(),
          currency: currency || salesInvoice.currency,
          amount: totalRevenue,
          cost_of_goods: totalCost,
          account: "sales_credit",
          customer: salesInvoice.customer,
          description: `Credit Note for Invoice #${invoiceNumber}`,
          category: salesInvoice.category || "Sales Credit",
          profit: totalProfit,
          profit_margin_percentage: profitPercentage,
          products: invoiceItems.map((item) => ({
            ...item,
            revenue: item.total,
          })),
          salesInvoiceNumber: invoice,
          client_id: req.des?.client_id,
          created_by: req.user?.username,
        });
      }

      // Log activity
      await Activity.create({
        related_id: id,
        activity_from: "sales_creditnote",
        activity_id: salesCreditnote.id,
        action: "created",
        performed_by: req.user?.username,
        client_id: req.des?.client_id,
        activity_message: `Credit note of ${amount} ${currency || salesInvoice.currency
          } created for invoice #${invoice}. New invoice balance: ${newAmount}. Status changed to: ${newPaymentStatus}${shouldUpdateStock ? ". Stock updated for products." : ""
          }`,
      });

      return responseHandler.success(
        res,
        "Sales Credit Note created successfully",
        {
          creditNote: salesCreditnote,
          updatedInvoice: {
            id: salesInvoice.id,
            previousAmount: salesInvoice.amount,
            newAmount: newAmount,
            creditedAmount: amount,
            totalCreditedAmount: newTotalCredited,
            previousStatus: salesInvoice.payment_status,
            newStatus: newPaymentStatus,
            items: creditNoteItems,
          },
        }
      );
    } catch (error) {
      return responseHandler.error(res, error?.message);
    }
  },
};
