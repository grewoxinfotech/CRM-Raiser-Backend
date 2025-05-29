import Joi from "joi";
import Product from "../../models/productModel.js";
import validator from "../../utils/validator.js";
import responseHandler from "../../utils/responseHandler.js";
import Activity from "../../models/activityModel.js";
import uploadToS3 from "../../utils/uploadToS3.js";

export default {
  validator: validator({
    params: Joi.object({
      id: Joi.string().required(),
    }),
    body: Joi.object({
      name: Joi.string().required(),
      category: Joi.string().required(),
      buying_price: Joi.number().min(0).required(),
      selling_price: Joi.number().min(0).required(),
      sku: Joi.string().optional().allow("", null),
      currency: Joi.string().optional().allow("", null),
      hsn_sac: Joi.string().optional().allow("", null),
      description: Joi.string().optional().allow("", null),
      tax_name: Joi.string().optional().allow("", null),
      tax_percentage: Joi.number().min(0).optional().default(0),
      // Stock Management Fields
      stock_quantity: Joi.number().integer().min(0).default(0),
      min_stock_level: Joi.number().integer().min(0).default(0),
      max_stock_level: Joi.number().integer().min(0).optional(),
      reorder_quantity: Joi.number().integer().min(0).optional(),
      stock_status: Joi.string()
        .valid("in_stock", "low_stock", "out_of_stock")
        .default("in_stock"),
    }),
  }),
  handler: async (req, res) => {
    try {
      const {
        name,
        category,
        buying_price,
        selling_price,
        sku,
        hsn_sac,
        description,
        stock_quantity,
        min_stock_level,
        max_stock_level,
        reorder_quantity,
        stock_status,
        currency,
        tax_name,
        tax_percentage,
      } = req.body;


      const image = req.file;
      const imageUrl = await uploadToS3(
        image,
        "client",
        "products",
        req.user?.username
      );

      // Calculate initial stock status if not provided
      let calculatedStockStatus = stock_status;
      if (!stock_status) {
        if (stock_quantity <= 0) {
          calculatedStockStatus = "out_of_stock";
        } else if (stock_quantity <= min_stock_level) {
          calculatedStockStatus = "low_stock";
        } else {
          calculatedStockStatus = "in_stock";
        }
      }

      // Calculate profit metrics
      const profit_margin = selling_price - buying_price;
      const profit_percentage =
        buying_price > 0
          ? ((selling_price - buying_price) / buying_price) * 100
          : 0;
      const total_investment = buying_price * stock_quantity;
      // const potential_revenue = selling_price * stock_quantity;
      // const potential_profit = profit_margin * stock_quantity;

      const product = await Product.create({
        related_id: req.params.id,
        name,
        category,
        buying_price,
        selling_price,
        sku,
        hsn_sac,
        description,
        image: imageUrl,
        currency,
        tax_name,
        tax_percentage,
        profit_margin,
        profit_percentage,
        // Stock Management Fields
        stock_quantity,
        min_stock_level,
        max_stock_level,
        reorder_quantity,
        stock_status: calculatedStockStatus,
        last_stock_update: new Date(),
        client_id: req.des?.client_id,
        created_by: req.user?.username,
      });

      await Activity.create({
        related_id: req.params.id,
        activity_from: "product",
        activity_id: product.id,
        action: "created",
        performed_by: req.user?.username,
        client_id: req.des?.client_id,
        activity_message: `Product ${product.name
          } created successfully with initial stock quantity of ${stock_quantity}. Buying price: ${buying_price}, Selling price: ${selling_price}, Profit margin: ${profit_margin} (${profit_percentage.toFixed(
            2
          )}%)`,
      });

      return responseHandler.success(res, "Product created successfully", {
        ...product.toJSON(),
        profit_margin,
        profit_percentage,
        total_investment,
        // potential_revenue,
        // potential_profit
      });
    } catch (error) {
      return responseHandler.error(res, error?.message);
    }
  },
};
