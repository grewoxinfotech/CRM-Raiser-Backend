import Joi from "joi";
import Payment from "../../models/paymentModel.js";
import SalesInvoice from "../../models/salesInvoiceModel.js";
import SalesRevenue from "../../models/salesRevenueModel.js";
import Activity from "../../models/activityModel.js";
import Product from "../../models/productModel.js";
import validator from "../../utils/validator.js";
import responseHandler from "../../utils/responseHandler.js";

export default {
    validator: validator({
        params: Joi.object({
            id: Joi.string().required()
        }),
        body: Joi.object({
            project_name: Joi.string().optional().allow('', null),
            invoice: Joi.string().optional().allow('', null),   
            paidOn: Joi.date().optional().allow('', null),
            amount: Joi.string().optional().allow('', null),
            currency: Joi.string().optional().allow('', null),
            transactionId: Joi.string().optional().allow('', null),
            paymentMethod: Joi.string().optional().allow('', null),
            remark: Joi.string().optional().allow('', null),
            status: Joi.string().optional().allow('', null)
        })
    }),
    handler: async (req, res) => {
        try {
            const { id } = req.params;
            const { project_name, invoice, paidOn, amount, currency, transactionId, paymentMethod, remark, status } = req.body;

            // Check if payment already exists
            const existingPayment = await Payment.findOne({ where: { invoice, related_id: id } });
            if (existingPayment) {
                return responseHandler.error(res, "Payment already exists");
            }

            // Find the related sales invoice
            const salesInvoice = await SalesInvoice.findByPk(invoice);
            if (!salesInvoice) {
                return responseHandler.error(res, "Sales Invoice not found");
            }

            // Get existing payments total for this invoice
            const existingPayments = await Payment.findAll({
                where: { invoice }
            });
            const totalPaidAmount = existingPayments.reduce((sum, payment) => sum + Number(payment.amount), 0);

            // Check if payment amount is valid
            const remainingInvoiceAmount = salesInvoice.total - totalPaidAmount;
            if (Number(amount) > remainingInvoiceAmount) {
                return responseHandler.error(
                    res,
                    `Payment amount cannot be greater than remaining invoice amount (${remainingInvoiceAmount})`
                );
            }

            // Parse invoice items for revenue calculation
            let invoiceItems;
            try {
                // Check if items is already an object or a JSON string
                if (typeof salesInvoice.items === 'string') {
                    invoiceItems = JSON.parse(salesInvoice.items);
                } else {
                    invoiceItems = salesInvoice.items;
                }
                
                if (!Array.isArray(invoiceItems)) {
                    throw new Error("Invoice items is not an array");
                }
            } catch (error) {
                console.error('Error parsing invoice items:', error);
                return responseHandler.error(res, "Failed to parse invoice items: " + error.message);
            }

            // Check product stock availability before proceeding
            const newTotalPaid = totalPaidAmount + Number(amount);
            if (newTotalPaid >= salesInvoice.total) {
                // Only check stock if this payment will complete the invoice
                for (const item of invoiceItems) {
                    const product = await Product.findByPk(item.product_id);
                    if (!product) {
                        return responseHandler.error(res, `Product with ID ${item.product_id} not found`);
                    }
                    
                    if (product.stock_quantity < item.quantity) {
                        return responseHandler.error(
                            res, 
                            `Insufficient stock for product ${product.name}. Available: ${product.stock_quantity}, Required: ${item.quantity}`
                        );
                    }
                }
            }

            // Calculate proportional amounts for each item based on payment amount
            const paymentItems = invoiceItems.map(item => {
                const itemPercentage = item.total / salesInvoice.total;
                const itemPaymentAmount = Number(amount) * itemPercentage;
                const itemCostPercentage = item.buying_price / item.unit_price;
                const itemPaymentCost = itemPaymentAmount * itemCostPercentage;

                return {
                    ...item,
                    payment_amount: itemPaymentAmount,
                    payment_cost: itemPaymentCost,
                    payment_profit: itemPaymentAmount - itemPaymentCost,
                    payment_profit_percentage: ((itemPaymentAmount - itemPaymentCost) / itemPaymentCost * 100).toFixed(2)
                };
            });

            // Create payment recordwork
            const payment = await Payment.create({
                related_id: id,
                project_name,   
                invoice,
                paidOn,
                amount,
                currency,
                transactionId,
                paymentMethod,
                status,
                remark,
                client_id: req.des?.client_id,
                created_by: req.user?.username,
                updated_by: req.user?.username
            });

            // Calculate new total and determine payment status
            let newPaymentStatus = salesInvoice.payment_status;
            let shouldCreateRevenue = false;
            let shouldUpdateStock = false;

            // If total paid equals invoice total, mark as paid
            if (newTotalPaid >= salesInvoice.total) {
                newPaymentStatus = 'paid';
                shouldCreateRevenue = true;
                shouldUpdateStock = true;
            } 
            // If some amount is paid but not full, mark as partially_paid
            else if (newTotalPaid > 0) {
                newPaymentStatus = 'partially_paid';
                shouldCreateRevenue = true;
            }

            // Update invoice status
            await salesInvoice.update({
                amount: salesInvoice.total - newTotalPaid,
                payment_status: newPaymentStatus
            });

            // Update product stock if payment is complete
            if (shouldUpdateStock) {
                for (const item of invoiceItems) {
                    const product = await Product.findByPk(item.product_id);
                    if (product) {
                        await product.update({
                            stock_quantity: product.stock_quantity - item.quantity,
                            updated_by: req.user?.username
                        });
                    }
                }
            }

            // Create revenue entry for the payment
            if (shouldCreateRevenue) {
                // Calculate totals for revenue
                const totalCost = paymentItems.reduce((sum, item) => sum + item.payment_cost, 0);
                const totalProfit = Number(amount) - totalCost;
                const profitPercentage = (totalProfit / totalCost * 100).toFixed(2);

                await SalesRevenue.create({
                    related_id: id,
                    date: paidOn || new Date(),
                    currency: currency || salesInvoice.currency,
                    amount: amount,
                    cost_of_goods: totalCost,
                    account: 'sales_payment',
                    customer: salesInvoice.customer,
                    description: `Payment received for Invoice #${invoice}`,
                    category: salesInvoice.category || 'Sales Payment',
                    products: paymentItems.map(item => ({
                        ...item,
                        revenue: item.payment_amount,
                        cost: item.payment_cost,
                        profit: item.payment_profit,
                        profit_percentage: item.payment_profit_percentage
                    })),
                    client_id: req.des?.client_id,
                    created_by: req.user?.username
                });
            }

            // Log activity
            await Activity.create({
                related_id: id,
                activity_from: "payment",
                activity_id: payment.id,
                action: "created",
                performed_by: req.user?.username,
                client_id: req.des?.client_id,
                activity_message: `Payment of ${amount} ${currency || salesInvoice.currency} received for invoice #${invoice}. New invoice balance: ${salesInvoice.total - newTotalPaid}. Status changed to: ${newPaymentStatus}${shouldUpdateStock ? '. Stock updated for products.' : ''}`
            });

            return responseHandler.created(res, "Payment created successfully", {
                payment,
                updatedInvoice: {
                    id: salesInvoice.id,
                    previousAmount: salesInvoice.amount,
                    newAmount: salesInvoice.total - newTotalPaid,
                    paidAmount: amount,
                    totalPaidAmount: newTotalPaid,
                    previousStatus: salesInvoice.payment_status,
                    newStatus: newPaymentStatus,
                    items: paymentItems,
                    stockUpdated: shouldUpdateStock
                }
            });
        } catch (error) {
            console.error('Error creating payment:', error);
            return responseHandler.error(res, error?.message);
        }
    }
};
