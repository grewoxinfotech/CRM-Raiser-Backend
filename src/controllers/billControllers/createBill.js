import Joi from "joi";
import Bill from "../../models/billModel.js";
import Setting from "../../models/settingModel.js";
import Product from "../../models/productModel.js";
import Activity from "../../models/activityModel.js";
import responseHandler from "../../utils/responseHandler.js";
import validator from "../../utils/validator.js";

export default {
  validator: validator({
    params: Joi.object({
      id: Joi.string().required(),
    }),
    body: Joi.object({
      vendor: Joi.string().required(),
      billNumber: Joi.string().required(),
      billDate: Joi.date().required(),
      discription: Joi.string().optional().allow("", null),
      status: Joi.string().optional(),
      discount: Joi.number().optional(),
      tax: Joi.number().optional(),
      currency: Joi.string().optional(),
      items: Joi.array().required(),
      total: Joi.number().required(),
      note: Joi.string().optional(),
      subTotal: Joi.number().required(),
      overallDiscountType: Joi.string().optional().allow("", null),
      overallDiscount: Joi.number().optional().allow("", null),
      overallDiscountAmount: Joi.number().optional().allow("", null),
      overallTax: Joi.string().optional().allow("", null),
      overallTaxAmount: Joi.number().optional().allow("", null),
    }),
  }),
  handler: async (req, res) => {
    try {
      const { id } = req.params;
      const {
        vendor,
        billNumber,
        billDate,
        discription,
        status,
        discount,
        tax,
        currency,
        items,
        total,
        note,
        subTotal,
        overallDiscountType,
        overallDiscount,
        overallDiscountAmount,
        overallTax,
        overallTaxAmount,
      } = req.body;

      // Get settings for UPI details
      const settings = await Setting.findOne({
        where: { client_id: req.des?.client_id },
      });

      // Create UPI link using settings
      const upiLink = `upi://pay?pa=${settings?.merchant_upi_id || ""}&pn=${settings?.merchant_name || ""
        }&am=${total}&cu=INR`;

      // Create new bill
      const newBill = await Bill.create({
        related_id: id,
        vendor,
        billNumber,
        billDate,
        discription,
        status,
        discount,
        tax,
        currency,
        upiLink,
        items,
        amount: total,
        overallDiscountType,
        overallDiscount,
        overallDiscountAmount,
        overallTax,
        overallTaxAmount,
        total,
        note,
        subTotal,
        bill_status: "draft",
        client_id: req.des?.client_id,
        created_by: req.user?.username,
      });

      // Update product stock quantities for all bills
      for (const item of items) {
        if (item.product_id) {
          const product = await Product.findOne({
            where: {
              id: item.product_id,
              client_id: req.des?.client_id,
            },
          });

          if (product) {
            const newStockQuantity =
              product.stock_quantity + Number(item.quantity);

            // Calculate new stock status
            let newStockStatus = product.stock_status;
            if (newStockQuantity <= 0) {
              newStockStatus = "out_of_stock";
            } else if (newStockQuantity <= product.min_stock_level) {
              newStockStatus = "low_stock";
            } else {
              newStockStatus = "in_stock";
            }

            // Update product
            await Product.update(
              {
                stock_quantity: newStockQuantity,
                stock_status: newStockStatus,
                last_stock_update: new Date(),
                updated_by: req.user?.username,
              },
              {
                where: {
                  id: item.product_id,
                  client_id: req.des?.client_id,
                },
              }
            );

            // Create activity log for stock update
            await Activity.create({
              related_id: id,
              activity_from: "bill",
              activity_id: newBill.id,
              action: "stock_updated",
              performed_by: req.user?.username,
              client_id: req.des?.client_id,
              activity_message: `Stock quantity for product ${item.itemName} increased by ${item.quantity} units from bill ${billNumber}. New stock quantity: ${newStockQuantity}`,
            });
          }
        }
      }

      return responseHandler.success(res, "Bill created successfully", newBill);
    } catch (error) {
      return responseHandler.error(res, error?.message);
    }
  },
};
