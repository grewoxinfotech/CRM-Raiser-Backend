import Joi from "joi";
import SalesInvoice from "../../models/salesInvoiceModel.js";
import Product from "../../models/productModel.js";
import SalesRevenue from "../../models/salesRevenueModel.js";
import validator from "../../utils/validator.js";
import responseHandler from "../../utils/responseHandler.js";
import Activity from "../../models/activityModel.js";
import Notification from "../../models/notificationModel.js";
import Setting from "../../models/settingModel.js";
import dayjs from "dayjs";
import Tax from "../../models/taxModel.js";
import Deal from "../../models/dealModel.js";

export default {
  validator: validator({
    params: Joi.object({
      id: Joi.string().required(),
    }),
    body: Joi.object({
      customer: Joi.string().optional(),
      section: Joi.string().optional(),
      issueDate: Joi.date().optional(),
      dueDate: Joi.date().optional(),
      category: Joi.string().optional().allow("", null),
      items: Joi.array().required(),
      payment_status: Joi.string()
        .valid("paid", "unpaid", "partially_paid")
        .optional(),
      currency: Joi.string().optional(),
      additional_notes: Joi.string().optional().allow("", null),
      tax: Joi.number().optional().allow("", null),
      discount: Joi.number().optional().allow("", null),
      subtotal: Joi.number().optional().allow("", null),
      total: Joi.number().optional().allow("", null),
      amount: Joi.number().optional(),
    }),
  }),
  handler: async (req, res) => {
    try {
      const { id } = req.params;
      const {
        customer,
        issueDate,
        dueDate,
        category,
        items,
        payment_status,
        currency,
        additional_notes,
        section,
        tax,
        discount,
        amount,
      } = req.body;

      // Find the invoice
      const salesInvoice = await SalesInvoice.findByPk(id);
      if (!salesInvoice) {
        return responseHandler.error(res, "SalesInvoice not found");
      }

      // Store original payment status
      const originalPaymentStatus = salesInvoice.payment_status;

      // Delete existing notifications for this invoice
      await Notification.destroy({
        where: {
          related_id: id,
          section: section || salesInvoice.section,
        },
        force: true,
      });

      const isBecomingPaid =
        payment_status === "paid" && salesInvoice.payment_status !== "paid";
      const isBecomingUnpaid =
        payment_status === "unpaid" && salesInvoice.payment_status === "paid";

      const isOnlyStatusChange =
        customer === salesInvoice.customer &&
        issueDate === salesInvoice.issueDate &&
        dueDate === salesInvoice.dueDate &&
        category === salesInvoice.category &&
        currency === salesInvoice.currency &&
        JSON.stringify(items) ===
        JSON.stringify(JSON.parse(salesInvoice.items));

      // Handle revenue and stock updates for status changes
      if (isBecomingUnpaid) {
        // Find existing revenue entry for this invoice
        const existingRevenue = await SalesRevenue.findOne({
          where: {
            salesInvoiceNumber: id,
          },
        });

        if (existingRevenue) {
          // Delete the existing revenue entry
          await SalesRevenue.destroy({
            where: {
              id: existingRevenue.id,
            },
            force: true,
          });

          // Log revenue deletion activity
          await Activity.create({
            related_id: req.user.id,
            activity_from: "sales_revenue",
            activity_id: existingRevenue.id,
            action: "deleted",
            performed_by: req.user?.username,
            client_id: req.des?.client_id,
            activity_message: `Revenue entry deleted for invoice ${salesInvoice.salesInvoiceNumber}. Amount: ${salesInvoice.total} ${salesInvoice.currency}`,
          });
        }

        // Update product stock - add quantities back
        const items = JSON.parse(salesInvoice.items);
        for (const item of items) {
          const product = await Product.findByPk(item.product_id);
          if (product) {
            await product.update({
              stock_quantity: product.stock_quantity + item.quantity,
              updated_by: req.user?.username,
            });
          }
        }
      }

      // If becoming paid, update product stock - reduce quantities
      if (isBecomingPaid) {
        const items = JSON.parse(salesInvoice.items);
        for (const item of items) {
          const product = await Product.findByPk(item.product_id);
          if (product) {
            // Check if enough stock is available
            if (product.stock_quantity < item.quantity) {
              return responseHandler.error(
                res,
                `Insufficient stock for product ${product.name}`
              );
            }
            await product.update({
              stock_quantity: product.stock_quantity - item.quantity,
              updated_by: req.user?.username,
            });
          }
        }
      }

      // If only status is changing, preserve original calculations
      if (isOnlyStatusChange) {
        const existingItems = JSON.parse(salesInvoice.items);

        // Update only payment status
        await salesInvoice.update({
          payment_status,
          amount: payment_status === "paid" ? 0 : salesInvoice.total,
          updated_by: req.user?.username,
        });

        // Create sales revenue entry if becoming paid
        if (isBecomingPaid) {
          await SalesRevenue.create({
            related_id: req.user.id,
            date: issueDate,
            currency,
            amount: salesInvoice.total,
            cost_of_goods: salesInvoice.cost_of_goods,
            account: "sales",
            customer,
            description: `Payment for Invoice #${salesInvoice.salesInvoiceNumber}`,
            category: category || "Sales",
            products: existingItems.map((item) => ({
              ...item,
              revenue: item.total,
            })),
            salesInvoiceNumber: salesInvoice.id,
            client_id: req.des?.client_id,
            created_by: req.user?.username,
          });

          // Log payment received activity
          await Activity.create({
            related_id: req.user.id,
            activity_from: "sales_invoice",
            activity_id: salesInvoice.id,
            action: "payment_received",
            performed_by: req.user?.username,
            client_id: req.des?.client_id,
            activity_message: `Payment received for invoice ${salesInvoice.salesInvoiceNumber}. Amount: ${salesInvoice.total} ${currency}`,
          });
        }

        // Create notifications for unpaid invoices
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
            section: section || salesInvoice.section,
            parent_id: salesInvoice.related_id,
            message: `Invoice #${salesInvoice.salesInvoiceNumber} is due today`,
            description: `💰 Invoice Due Today:
• Invoice #: ${salesInvoice.salesInvoiceNumber}
• Amount: ${salesInvoice.total} ${currency}
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
            section: section || salesInvoice.section,
            parent_id: salesInvoice.related_id,
            message: `Invoice #${salesInvoice.salesInvoiceNumber} is due tomorrow`,
            description: `💰 Invoice Due Tomorrow:
• Invoice #: ${salesInvoice.salesInvoiceNumber}
• Amount: ${salesInvoice.total} ${currency}
• Due Date: ${dueDate}
• Customer: ${customer}
• Status: ${payment_status}`,
            created_by: req.user?.username,
          });
        }

        // Log update activity
        await Activity.create({
          related_id: req.user.id,
          activity_from: "sales_invoice",
          activity_id: salesInvoice.id,
          action: "updated",
          performed_by: req.user?.username,
          client_id: req.des?.client_id,
          activity_message: `Sales invoice ${salesInvoice.salesInvoiceNumber} updated for ${salesInvoice.total} ${currency} with profit of ${salesInvoice.profit.toFixed(2)} (${salesInvoice.profit_percentage.toFixed(2)}%). Status: ${payment_status}`,
        });

        // Just before the payment status check
        console.log("Checking payment status condition:", {
          newStatus: payment_status,
          currentStatus: salesInvoice.payment_status,
          willUpdateDeal: payment_status === 'paid' && salesInvoice.payment_status !== 'paid'
        });

        if (payment_status === 'paid' && salesInvoice.payment_status !== 'paid') {
          console.log("Inside payment status block - will update deal");

          // Get the related deal
          const deal = await Deal.findOne({
            where: { id: salesInvoice.related_id }
          });

          console.log("Deal search result:", {
            searchId: salesInvoice.related_id,
            dealFound: !!deal,
            dealDetails: deal ? {
              id: deal.id,
              value: deal.value
            } : null
          });

          if (deal) {
            const currentValue = deal.value || 0;
            const newValue = currentValue + salesInvoice.total;

            console.log("Updating deal value:", {
              dealId: deal.id,
              currentValue,
              invoiceAmount: salesInvoice.total,
              newValue
            });

            // Update the deal
            await deal.update({
              value: newValue,
              updated_by: req.user?.username
            });

            console.log("Deal update completed");
          }
        }

        return responseHandler.success(
          res,
          "SalesInvoice updated successfully",
          {
            ...salesInvoice.toJSON(),
            metrics: {
              subtotal: salesInvoice.subtotal,
              tax: salesInvoice.tax,
              discount: salesInvoice.discount,
              total: salesInvoice.total,
              cost_of_goods: salesInvoice.cost_of_goods,
              profit: salesInvoice.profit,
              profit_percentage: salesInvoice.profit_percentage.toFixed(2),
            },
          }
        );
      }

      // If other fields are changing, proceed with full update logic
      let total_cost_of_goods = 0;
      let subtotal = 0;
      let total_tax = 0;
      let total_discount = 0;
      let verified_products = [];

      // Parse existing items to revert stock if needed
      const existingItems = JSON.parse(salesInvoice.items);

      // First handle stock updates for existing items if payment status is changing
      if (isBecomingUnpaid) {
        for (const existingItem of existingItems) {
          const product = await Product.findByPk(existingItem.product_id);
          if (product) {
            await product.update({
              stock_quantity: product.stock_quantity + existingItem.quantity,
              updated_by: req.user?.username,
            });
          }
        }
      }

      // Verify and process each new item
      for (const item of items) {
        const product = await Product.findByPk(item.product_id);
        if (!product) {
          return responseHandler.error(
            res,
            `Product with ID ${item.product_id} not found`
          );
        }

        // Find existing item quantity if any
        const existingItem = existingItems.find(
          (ei) => ei.product_id === item.product_id
        );
        const quantityDiff = item.quantity - (existingItem?.quantity || 0);

        // If becoming paid, verify stock for full quantity
        if (isBecomingPaid) {
          if (product.stock_quantity < item.quantity) {
            return responseHandler.error(
              res,
              `Insufficient stock for product ${product.name}`
            );
          }
        }
        // If staying paid or unpaid, only verify additional quantity
        else if (!isBecomingUnpaid && quantityDiff > 0) {
          if (product.stock_quantity < quantityDiff) {
            return responseHandler.error(
              res,
              `Insufficient stock for product ${product.name}`
            );
          }
        }

        // Calculate item level metrics
        const item_cost = product.buying_price * item.quantity;
        const item_subtotal = item.unit_price * item.quantity;

        // Calculate discount first
        const item_discount = item.discount || 0;
        const item_discount_type = item.discount_type || "percentage";
        let item_discount_amount = 0;

        if (item_discount_type === "percentage") {
          item_discount_amount = (item_subtotal * item_discount) / 100;
        } else {
          item_discount_amount = item_discount;
        }

        // Calculate amount after discount
        const amount_after_discount = item_subtotal - item_discount_amount;

        // Calculate tax on discounted amount
        let item_tax = 0;
        if (item.tax) {
          const taxData = await Tax.findByPk(item.tax);
          if (taxData) {
            const taxPercentage = parseFloat(taxData.gstPercentage);
            item_tax = (amount_after_discount * taxPercentage) / 100;
            console.log(`Tax calculated from tax ID: ${item_tax} (${taxPercentage}% of ${amount_after_discount})`);
          }
        }
        // Use tax_percentage directly if provided
        else if (item.tax_percentage && item.tax_percentage > 0) {
          const taxPercentage = parseFloat(item.tax_percentage);
          item_tax = (amount_after_discount * taxPercentage) / 100;
          console.log(`Tax calculated from tax_percentage: ${item_tax} (${taxPercentage}% of ${amount_after_discount})`);
        }

        const item_total = amount_after_discount + item_tax;
        console.log(`Item summary - ${product.name}: Subtotal: ${item_subtotal}, Discount: ${item_discount_amount}, Tax: ${item_tax}, Total: ${item_total}`);

        const item_profit = item_total - item_cost;
        const item_profit_percentage =
          item_cost > 0 ? (item_profit / item_cost) * 100 : 0;

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
          discount_amount: item_discount_amount,
          amount_after_discount: amount_after_discount,
          total: item_total,
          profit: item_profit,
          profit_percentage: item_profit_percentage.toFixed(2),
        });

        // Update product stock if becoming paid
        if (isBecomingPaid) {
          await product.update({
            stock_quantity: product.stock_quantity - item.quantity,
            updated_by: req.user?.username,
          });
        }
      }

      // Calculate final totals
      const total = subtotal + total_tax - total_discount;
      console.log(`Final totals - Subtotal: ${subtotal}, Tax: ${total_tax}, Discount: ${total_discount}, Total: ${total}`);

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

      // Update invoice with full changes
      await salesInvoice.update({
        customer,
        issueDate,
        dueDate,
        category,
        items: verified_products,
        payment_status,
        currency,
        subtotal,
        tax: total_tax,
        discount: total_discount,
        total,
        amount: payment_status === "paid" ? 0 : total,
        cost_of_goods: total_cost_of_goods,
        profit: total_profit,
        profit_percentage: profit_percentage.toFixed(2),
        additional_notes,
        upiLink,
        updated_by: req.user?.username,
      });

      // Create sales revenue entry only when status changes to paid
      if (isBecomingPaid) {
        await SalesRevenue.create({
          related_id: req.user.id,
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

        // Log payment received activity
        await Activity.create({
          related_id: req.user.id,
          activity_from: "sales_invoice",
          activity_id: salesInvoice.id,
          action: "payment_received",
          performed_by: req.user?.username,
          client_id: req.des?.client_id,
          activity_message: `Payment received for invoice ${salesInvoice.salesInvoiceNumber}. Amount: ${total} ${currency}`,
        });
      }

      // Create notifications for unpaid invoices
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
          section: section || salesInvoice.section,
          parent_id: salesInvoice.related_id,
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
          section: section || salesInvoice.section,
          parent_id: salesInvoice.related_id,
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

      // Log update activity
      await Activity.create({
        related_id: req.user.id,
        activity_from: "sales_invoice",
        activity_id: salesInvoice.id,
        action: "updated",
        performed_by: req.user?.username,
        client_id: req.des?.client_id,
        activity_message: `Sales invoice ${salesInvoice.salesInvoiceNumber} updated for ${total} ${currency} with profit of ${total_profit.toFixed(2)} (${profit_percentage.toFixed(2)}%). Status: ${payment_status}`,
      });

      // After all invoice updates are done, check if we need to update the deal
      const updatedInvoice = await SalesInvoice.findByPk(id);
      const updatedInvoiceData = updatedInvoice.dataValues;

      // Get the deal if it exists
      const deal = await Deal.findOne({
        where: { id: updatedInvoiceData.related_id }
      });

      if (deal) {
        const currentValue = deal.value || 0;
        let newValue = currentValue;

        // If changing to paid, add the invoice total
        if (updatedInvoiceData.payment_status === 'paid' && originalPaymentStatus !== 'paid') {
          newValue = currentValue + updatedInvoiceData.total;
        }
        // If changing from paid to unpaid, subtract the invoice total
        else if (updatedInvoiceData.payment_status !== 'paid' && originalPaymentStatus === 'paid') {
          newValue = currentValue - updatedInvoiceData.total;
        }

        // Only update if the value has changed
        if (newValue !== currentValue) {
          await deal.update({
            value: newValue,
            updated_by: req.user?.username
          });
        }
      }

      return responseHandler.success(res, "SalesInvoice updated successfully", {
        ...updatedInvoice.toJSON(),
        metrics: {
          subtotal,
          tax: total_tax,
          discount: total_discount,
          total,
          cost_of_goods: total_cost_of_goods,
          profit: total_profit,
          profit_percentage: profit_percentage.toFixed(2),
        },
      });
    } catch (error) {
      console.error("Error in updateSalesInvoice:", error);
      return responseHandler.error(res, error?.message);
    }
  },
};
