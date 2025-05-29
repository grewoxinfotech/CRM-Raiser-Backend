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
      vendor: Joi.string().optional(),
      billDate: Joi.date().optional(),
      discription: Joi.string().optional().allow("", null),
      status: Joi.string().optional(),
      discount: Joi.number().optional(),
      tax: Joi.number().optional(),
      currency: Joi.string().optional(),
      items: Joi.array().optional(),
      total: Joi.number().optional(),
      note: Joi.string().optional(),
      subTotal: Joi.number().optional(),
      overallDiscountType: Joi.string().optional(),
      overallDiscount: Joi.number().optional(),
      overallDiscountAmount: Joi.number().optional(),
      overallTax: Joi.string().optional().allow("", null),
      overallTaxAmount: Joi.number().optional().allow("", null),
    }),
  }),
  handler: async (req, res) => {
    try {
      const { id } = req.params;
      const {
        vendor,
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

      // Find existing bill
      const existingBill = await Bill.findByPk(id);
      if (!existingBill) {
        return responseHandler.error(res, "Bill not found");
      }

      // Parse old and new items
      const oldItems =
        typeof existingBill.items === "string"
          ? JSON.parse(existingBill.items)
          : existingBill.items;
      const newItems = items;

      // Update product stock based on quantity difference
      if (oldItems && newItems) {
        for (const newItem of newItems) {
          // Find corresponding old item
          const oldItem = oldItems.find(
            (item) => item.product_id === newItem.product_id
          );

          if (oldItem && newItem.product_id) {
            const oldQuantity = Number(oldItem.quantity) || 0;
            const newQuantity = Number(newItem.quantity) || 0;
            const quantityDifference = newQuantity - oldQuantity;

            // Only update stock if quantity has changed
            if (quantityDifference !== 0) {
              const product = await Product.findOne({
                where: {
                  id: newItem.product_id,
                  client_id: req.des?.client_id,
                },
              });

              if (product) {
                const newStockQuantity =
                  product.stock_quantity + quantityDifference;

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
                      id: newItem.product_id,
                      client_id: req.des?.client_id,
                    },
                  }
                );

                // Create activity log for stock update
                await Activity.create({
                  related_id: existingBill.related_id,
                  activity_from: "bill",
                  activity_id: id,
                  action: "stock_updated",
                  performed_by: req.user?.username,
                  client_id: req.des?.client_id,
                  activity_message: `Stock quantity for product ${newItem.itemName
                    } ${quantityDifference > 0 ? "increased" : "decreased"
                    } by ${Math.abs(quantityDifference)} units from bill ${existingBill.billNumber
                    }. New stock quantity: ${newStockQuantity}`,
                });
              }
            }
          }
        }
      }

      // Get settings for UPI details
      const settings = await Setting.findOne({
        where: { client_id: req.des?.client_id },
      });

      // Create UPI link using settings
      const upiLink = `upi://pay?pa=${settings?.merchant_upi_id || ""}&pn=${settings?.merchant_name || ""
        }&am=${total || existingBill.total}&cu=INR`;

      // Update bill with new fields
      await existingBill.update({
        vendor,
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
        updated_by: req.user?.username,
      });

      return responseHandler.success(
        res,
        "Bill updated successfully",
        existingBill
      );
    } catch (error) {
      return responseHandler.error(res, error?.message);
    }
  },
};
