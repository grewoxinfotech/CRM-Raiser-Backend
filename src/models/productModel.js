import { DataTypes } from "sequelize";
import sequelize from "../config/db.js";
import generateId from "../middlewares/generatorId.js";

const Product = sequelize.define("Product", {
  id: {
    type: DataTypes.STRING,
    primaryKey: true,
    unique: true,
    defaultValue: () => generateId(),
  },
  related_id: {
    type: DataTypes.STRING,
    allowNull: false,
  },
  name: {
    type: DataTypes.STRING,
    allowNull: false,
  },
  currency: {
    type: DataTypes.STRING,
    allowNull: false,
    defaultValue: "INR",
  },
  buying_price: {
    type: DataTypes.FLOAT,
    allowNull: false,
    defaultValue: 0,
    validate: {
      min: 0,
    },
  },
  selling_price: {
    type: DataTypes.FLOAT,
    allowNull: false,
    validate: {
      min: 0,
    },
  },
  profit_margin: {
    type: DataTypes.STRING,
    defaultValue: null,
    allowNull: true,
  },
  profit_percentage: {
    type: DataTypes.STRING,
    defaultValue: null,
    allowNull: true,
  },
  category: {
    type: DataTypes.STRING,
    allowNull: false,
  },
  sku: {
    type: DataTypes.STRING,
    allowNull: true,
    defaultValue: null,
  },
  hsn_sac: {
    type: DataTypes.STRING,
    allowNull: true,
    defaultValue: null,
  },
  description: {
    type: DataTypes.TEXT,
    allowNull: true,
    defaultValue: null,
  },
  tax_name: {
    type: DataTypes.STRING,
    allowNull: true,
    defaultValue: null,
  },
  tax_percentage: {
    type: DataTypes.FLOAT,
    allowNull: true,
    defaultValue: 0,
    validate: {
      min: 0,
    },
  },
  image: {
    type: DataTypes.STRING,
    allowNull: true,
    defaultValue: null,
  },
  // Stock Management Fields
  stock_quantity: {
    type: DataTypes.INTEGER,
    allowNull: false,
    defaultValue: 0,
    validate: {
      min: 0,
    },
  },
  min_stock_level: {
    type: DataTypes.INTEGER,
    allowNull: false,
    defaultValue: 0,
    validate: {
      min: 0,
    },
  },
  max_stock_level: {
    type: DataTypes.INTEGER,
    allowNull: true,
    defaultValue: null,
    validate: {
      min: 0,
    },
  },
  reorder_quantity: {
    type: DataTypes.INTEGER,
    allowNull: true,
    defaultValue: null,
    validate: {
      min: 0,
    },
  },
  stock_status: {
    type: DataTypes.ENUM("in_stock", "low_stock", "out_of_stock"),
    allowNull: false,
    defaultValue: "in_stock",
  },
  last_stock_update: {
    type: DataTypes.DATE,
    allowNull: false,
    defaultValue: DataTypes.NOW,
  },
  total_investment: {
    type: DataTypes.STRING,
    defaultValue: null,
    allowNull: true,
  },
  potential_revenue: {
    type: DataTypes.STRING,
    defaultValue: null,
    allowNull: true,
  },
  potential_profit: {
    type: DataTypes.STRING,
    defaultValue: null,
    allowNull: true,
  },
  client_id: {
    type: DataTypes.STRING,
    allowNull: false,
  },
  created_by: {
    type: DataTypes.STRING,
    allowNull: true,
    defaultValue: null,
  },
  updated_by: {
    type: DataTypes.STRING,
    allowNull: true,
    defaultValue: null,
  },
});

// Add hook to automatically update stock status when stock quantity changes
Product.beforeSave(async (product) => {
  // Generate unique ID for new products
  if (!product.id) {
    let isUnique = false;
    let newId;
    while (!isUnique) {
      newId = generateId();
      const existingProduct = await Product.findOne({
        where: { id: newId },
      });
      if (!existingProduct) {
        isUnique = true;
      }
    }
    product.id = newId;
  }

  // Update stock status based on quantity
  if (product.changed("stock_quantity")) {
    product.last_stock_update = new Date();

    if (product.stock_quantity <= 0) {
      product.stock_status = "out_of_stock";
    } else if (product.stock_quantity <= product.min_stock_level) {
      product.stock_status = "low_stock";
    } else {
      product.stock_status = "in_stock";
    }
  }
});

export default Product;
