import Joi from "joi";
import SalesRevenue from "../../models/salesRevenueModel.js";
import Product from "../../models/productModel.js";
import validator from "../../utils/validator.js";
import responseHandler from "../../utils/responseHandler.js";
import Activity from "../../models/activityModel.js";

export default {
  validator: validator({
 
    body: Joi.object({
      date: Joi.date().required(),
      currency: Joi.string().optional(),
      account: Joi.string().required(),
      customer: Joi.string().required(),
      description: Joi.string().optional().allow('', null),
      category: Joi.string().required(),
      products: Joi.array().items(
        Joi.object({
          product_id: Joi.string().required(),
          quantity: Joi.number().integer().min(1).required(),
          selling_price: Joi.number().min(0).required()
        })
      ).required().min(1) // Making products array required with at least one product
    }),
  }),
  handler: async (req, res) => {
    try {
      const {
        date,
        currency,
        account,
        customer,
        description,
        category,
        products
      } = req.body;

      // Calculate cost of goods and verify products
      let total_cost_of_goods = 0;
      let total_revenue = 0;
      let verified_products = [];

      for (const item of products) {
        const product = await Product.findByPk(item.product_id);
        if (!product) {
          return responseHandler.error(res, `Product with ID ${item.product_id} not found`);
        }

        // Verify stock availability
        if (product.stock_quantity < item.quantity) {
          return responseHandler.error(res, `Insufficient stock for product ${product.name}`);
        }

        // Verify selling price is not less than buying price
        if (item.selling_price < product.buying_price) {
          return responseHandler.error(res, `Selling price (${item.selling_price}) cannot be less than buying price (${product.buying_price}) for product ${product.name}`);
        }

        // Calculate cost and revenue for this product
        const item_cost = product.buying_price * item.quantity;
        const item_revenue = item.selling_price * item.quantity;
        
        total_cost_of_goods += item_cost;
        total_revenue += item_revenue;

        // Calculate profit for this product
        const item_profit = item_revenue - item_cost;
        const item_profit_percentage = item_cost > 0 ? ((item_revenue - item_cost) / item_cost) * 100 : 0;

        // Update product stock
        await product.update({
          stock_quantity: product.stock_quantity - item.quantity,
          updated_by: req.user?.username
        });

        // Add verified product with profit details
        verified_products.push({
          ...item,
          name: product.name,
          buying_price: product.buying_price,
          total_cost: item_cost,
          total_revenue: item_revenue,
          profit: item_profit,
          profit_percentage: item_profit_percentage.toFixed(2)
        });
      }

      // Calculate overall profit metrics
      const total_profit = total_revenue - total_cost_of_goods;
      const profit_percentage = total_cost_of_goods > 0 ? ((total_revenue - total_cost_of_goods) / total_cost_of_goods) * 100 : 0;

      const salesRevenue = await SalesRevenue.create({
        related_id: req.user.id,
        date,
        currency,
        amount: total_revenue, // Using calculated total revenue instead of user input
        cost_of_goods: total_cost_of_goods,
        account,
        customer,
        description,
        category,
        products: verified_products,
        client_id: req.des?.client_id,
        created_by: req.user?.username,
      });

      await Activity.create({
        related_id: req.user.id,
        activity_from: "sales_revenue",
        activity_id: salesRevenue.id,
        action: "created",
        performed_by: req.user?.username,
        client_id: req.des?.client_id,
        activity_message: `Sales revenue of ${total_revenue} ${currency || ''} created with profit of ${total_profit.toFixed(2)} (${profit_percentage.toFixed(2)}%)`
      });

      return responseHandler.success(res, "Sales revenue created successfully", {
        ...salesRevenue.toJSON(),
        profit_metrics: {
          total_revenue,
          total_cost: total_cost_of_goods,
          total_profit,
          profit_percentage: profit_percentage.toFixed(2)
        }
      });
    } catch (error) {
      return responseHandler.error(res, error?.message);
    }
  },
};
