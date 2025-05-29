import Joi from "joi";
import SalesInvoice from "../../models/salesInvoiceModel.js";
import Product from "../../models/productModel.js";
import SalesRevenue from "../../models/salesRevenueModel.js";
import validator from "../../utils/validator.js";
import responseHandler from "../../utils/responseHandler.js";
import Activity from "../../models/activityModel.js";
import Notification from "../../models/notificationModel.js";
import dayjs from "dayjs";
import Setting from "../../models/settingModel.js";
import Deal from "../../models/dealModel.js";

export default {
  validator: validator({
    params: Joi.object({
      id: Joi.string().required(),
    }),

    body: Joi.object({
      salesInvoiceNumber: Joi.string().optional(),
      customer: Joi.string().required(),
      section: Joi.string().required(),
      issueDate: Joi.date().required(),
      dueDate: Joi.date().required(),
      category: Joi.string().optional().allow("", null),
      items: Joi.array().required(),
      tax: Joi.number().optional().allow("", null),
      discount: Joi.number().optional().allow("", null),
      subtotal: Joi.number().optional().allow("", null),
      total: Joi.number().optional().allow("", null),
      payment_status: Joi.string()
        .valid("paid", "unpaid", "partially_paid")
        .default("unpaid"),
      currency: Joi.string().required(),
      additional_notes: Joi.string().optional().allow("", null),
    }),
  }),
  handler: async (req, res) => {
    try {
      const {
        customer,
        issueDate,
        dueDate,
        category,
        salesInvoiceNumber,
        items,
        payment_status,
        currency,
        additional_notes,
        section,
        tax,
        discount
      } = req.body;

      const { id } = req.params;

      // Calculate costs and verify products
      let total_cost_of_goods = 0;
      let subtotal = 0;
      let total_tax = 0;
      let total_discount = 0;
      let verified_products = [];

      // Verify and process each product
      for (const item of items) {
        const product = await Product.findByPk(item.product_id);

        if (!product) {
          return responseHandler.error(
            res,
            `Product with ID ${item.product_id} not found`
          );
        }

        // Verify stock availability
        if (product.stock_quantity < item.quantity) {
          return responseHandler.error(
            res,
            `Insufficient stock for product ${product.name}`
          );
        }

        // // Verify selling price is not less than buying price
        // if (item.unit_price < product.buying_price) {
        //     return responseHandler.error(res, `Selling price (${item.unit_price}) cannot be less than buying price (${product.buying_price}) for product ${product.name}`);
        // }

        // Calculate item level metrics
        const item_cost = product.buying_price * item.quantity;
        const item_subtotal = item.unit_price * item.quantity;

        // Calculate discount first
        const item_discount = item.discount || 0;
        const item_discount_type = item.discount_type;
        let item_discount_amount = 0;

        if (item_discount_type === "percentage") {
          item_discount_amount = (item_subtotal * item_discount) / 100;
        } else {
          item_discount_amount = item_discount;
        }

        // Calculate amount after discount
        const amount_after_discount = item_subtotal - item_discount_amount;

        // Get tax percentage and calculate tax on discounted amount
        let item_tax = 0;
        if (item.tax) {
          // Use product's tax_percentage directly from the request
          const taxPercentage = parseFloat(item.tax);
          item_tax = (amount_after_discount * taxPercentage) / 100;
        }

        const item_total = amount_after_discount + item_tax;
        const item_profit = product.profit_margin * item.quantity;
        const item_profit_percentage = product.profit_percentage;

        // Update running totals
        total_cost_of_goods += item_cost;
        subtotal += item_subtotal;
        total_tax += item_tax;
        total_discount += item_discount_amount;

        // Add to verified products
        verified_products.push({
          ...item,
          name: product.name,
          buying_price: product.buying_price,
          subtotal: item_subtotal,
          tax_amount: item_tax,
          tax_name: item.tax_name || product.tax_name,
          tax_percentage: item.tax || product.tax_percentage,
          discount_amount: item_discount_amount,
          discount_type: item_discount_type,
          amount_after_discount: amount_after_discount,
          total: item_total,
          profit: item_profit,
          profit_percentage: item_profit_percentage,
        });

        // Update product stock if invoice is marked as paid
        if (payment_status === "paid") {
          await product.update({
            stock_quantity: product.stock_quantity - item.quantity,
            updated_by: req.user?.username,
          });
        }
      }

      // Calculate final totals
      const total = subtotal + total_tax - total_discount;
      const total_profit = total - total_cost_of_goods;
      const profit_percentage =
        total_cost_of_goods > 0
          ? (total_profit / total_cost_of_goods) * 100
          : 0;

      // Get settings for UPI details
      const settings = await Setting.findOne({
        where: { client_id: req.des?.client_id },
      });

      // Create UPI link using settings
      const upiLink = `upi://pay?pa=${settings?.merchant_upi_id || ""}&pn=${settings?.merchant_name || ""
        }&am=${total}&cu=INR`;

      // Create invoice
      const salesInvoice = await SalesInvoice.create({
        related_id: id,
        customer,
        issueDate,
        dueDate,
        category,
        salesInvoiceNumber,
        items: verified_products,
        payment_status,
        currency,
        subtotal,
        tax: total_tax,
        discount,
        amount: total,
        total,
        cost_of_goods: total_cost_of_goods,
        profit: total_profit,
        profit_percentage: profit_percentage.toFixed(2),
        additional_notes,
        upiLink,
        client_id: req.des?.client_id,
        created_by: req.user?.username,
      });

      // Create single reminder notification for due date
      await Notification.create({
        related_id: salesInvoice.id,
        users: [customer],
        title: "Invoice Due Today",
        notification_type: "reminder",
        from: req.user?.id,
        client_id: req.des?.client_id,
        date: dueDate,
        time: "10:00:00",
        section: section,
        parent_id: id,
        message: `Invoice #${salesInvoice.id} is due today`,
        description: `⚠️ Invoice Payment Due:
• Invoice #: ${salesInvoice.id}
• Amount Due: ${total} ${currency}
• Due Date: ${dueDate}
• Status: ${payment_status}
• Items: ${verified_products.length}

Please ensure timely payment to avoid any late fees.`,
        created_by: req.user?.username,
      });

      // If invoice is marked as paid, create sales revenue entry
      if (payment_status === "paid") {
        await SalesRevenue.create({
          related_id: id,
          date: issueDate,
          currency,
          amount: total,
          cost_of_goods: total_cost_of_goods,
          account: "sales",
          customer,
          description: `Payment for Invoice #${salesInvoice.salesInvoiceNumber}`,
          category: category || "Sales",
          products: verified_products.map((item) => ({
            ...item,
            revenue: item.total,
          })),
          salesInvoiceNumber: salesInvoice.id,
          client_id: req.des?.client_id,
          created_by: req.user?.username,
        });

        // If invoice is created as paid, update the deal value
        const deal = await Deal.findOne({
          where: { id: id }
        });

        if (deal) {
          const currentValue = deal.value || 0;
          const newValue = currentValue + total;

          await deal.update({
            value: newValue,
            updated_by: req.user?.username
          });
        }
      }

      // Log activity
      await Activity.create({
        related_id: id,
        activity_from: "sales_invoice",
        activity_id: salesInvoice.id,
        action: "created",
        performed_by: req.user?.username,
        client_id: req.des?.client_id,
        activity_message: `Sales invoice #${salesInvoice.salesInvoiceNumber} created for `,
      });

      // After creating the sales invoice, add this code:
      if (payment_status === "unpaid") {
        // Create reminder for due date
        await Notification.create({
          related_id: salesInvoice.id,
          users: [customer],
          title: "Invoice Due Date Reminder",
          notification_type: "reminder",
          from: req.user?.id,
          client_id: req.des?.client_id,
          date: dueDate,
          time: "09:00",
          section: section,
          parent_id: id,
          message: `Invoice #${salesInvoice.salesInvoiceNumber} is due today`,
          description: `💰 Invoice Due Today:
• Invoice #: ${salesInvoice.salesInvoiceNumber}
• Amount: ${total} ${currency}
• Due Date: ${dueDate}
• Customer: ${customer}
• Status: ${payment_status}`,
          created_by: req.user?.username,
        });

        // Create reminder for day before due date
        const dayBeforeDue = dayjs(dueDate)
          .subtract(1, "day")
          .format("YYYY-MM-DD");
        await Notification.create({
          related_id: salesInvoice.id,
          users: [customer],
          title: "Invoice Due Tomorrow",
          notification_type: "reminder",
          from: req.user?.id,
          client_id: req.des?.client_id,
          date: dayBeforeDue,
          time: "09:00",
          section: section,
          parent_id: id,
          message: `Invoice #${salesInvoice.salesInvoiceNumber} is due tomorrow`,
          description: `💰 Invoice Due Tomorrow:
• Invoice #: ${salesInvoice.salesInvoiceNumber}
• Amount: ${total} ${currency}
• Due Date: ${dueDate}
• Customer: ${customer}
• Status: ${payment_status}`,
          created_by: req.user?.username,
        });
      }

      return responseHandler.success(
        res,
        "Sales invoice created successfully",
        {
          ...salesInvoice.toJSON(),
          metrics: {
            subtotal,
            tax: total_tax,
            discount: total_discount,
            total,
            cost_of_goods: total_cost_of_goods,
            profit: total_profit,
            profit_percentage: profit_percentage.toFixed(2),
          },
        }
      );
    } catch (error) {
      return responseHandler.error(res, error);
    }
  },
};
