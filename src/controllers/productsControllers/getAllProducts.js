import Product from "../../models/productModel.js";
import User from "../../models/userModel.js";
import Notification from "../../models/notificationModel.js";
import responseHandler from "../../utils/responseHandler.js";
import validator from "../../utils/validator.js";
import Joi from "joi";
import { Op } from "sequelize";

const createStockNotification = async (product, userId, clientId, username) => {
  // Check for out of stock
  if (product.stock_quantity <= 0) {
    await Notification.create({
      related_id: product.id,
      users: [userId],
      title: `Out of Stock Alert: ${product.name}`,
      notification_type: "normal",
      from: userId,
      client_id: clientId,
      section: "products",
      message: `Product ${product.name} is out of stock!`,
      description: `❌ Stock Alert:
• Current Stock: ${product.stock_quantity}
• Minimum Stock Level: ${product.min_stock_level}
• Status: Out of Stock
${product.reorder_quantity
          ? `• Recommended Reorder: ${product.reorder_quantity} units`
          : ""
        }`,
      created_by: username,
    });
  }
  // Check for low stock
  else if (product.stock_quantity <= product.min_stock_level) {
    await Notification.create({
      related_id: product.id,
      users: [userId],
      title: `Low Stock Alert: ${product.name}`,
      notification_type: "normal",
      from: userId,
      client_id: clientId,
      section: "products",
      message: `Product ${product.name} is running low on stock!`,
      description: `⚠️ Stock Alert:
• Current Stock: ${product.stock_quantity}
• Minimum Stock Level: ${product.min_stock_level}
• Status: Low Stock Warning
${product.reorder_quantity
          ? `• Recommended Reorder: ${product.reorder_quantity} units`
          : ""
        }`,
      created_by: username,
    });
  }

  // Check for reorder quantity
  if (
    product.reorder_quantity &&
    product.stock_quantity <= product.reorder_quantity
  ) {
    await Notification.create({
      related_id: product.id,
      users: [userId],
      title: `Reorder Alert: ${product.name}`,
      notification_type: "normal",
      from: userId,
      client_id: clientId,
      section: "products",
      message: `Time to reorder ${product.name}`,
      description: `🔄 Reorder Details:
• Current Stock: ${product.stock_quantity}
• Reorder Quantity: ${product.reorder_quantity}
• Minimum Stock Level: ${product.min_stock_level}
• Recommended Order: ${product.reorder_quantity} units
• Status: Time to place new order`,
      created_by: username,
    });
  }
};

export default {
  validator: validator({
    query: Joi.object({
      page: Joi.number().default(1),
      pageSize: Joi.number().default(10),
      search: Joi.string().allow('').optional()
    })
  }),
  handler: async (req, res) => {
    try {
      const user = await User.findOne({
        where: { id: req.user.id },
      });

      const { rows: products, count } = await Product.findAndCountAll({
        ...req.queryOptions,
        where: {
          [Op.or]: [{ client_id: user.client_id }, { client_id: user.id }]
        }
      });

      // Create notifications for each product
      for (const product of products) {
        await createStockNotification(
          product,
          req.user.id,
          user.client_id || user.id,
          req.user.username
        );
      }

      return responseHandler.success(res, {
        data: products.map(d => ({ ...d.toJSON(), key: d.id })),
        pagination: {
          total: count,
          ...req.pagination,
          totalPages: Math.ceil(count / req.pagination.pageSize)
        }
      });
    } catch (error) {
      console.error('Error in getAllProducts:', error);
      return responseHandler.error(res, error?.message);
    }
  },
};
