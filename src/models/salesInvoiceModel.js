import { DataTypes } from "sequelize";
import sequelize from "../config/db.js";
import generateId from "../middlewares/generatorId.js";

const SalesInvoice = sequelize.define("sales_Invoice", {
  id: {
    type: DataTypes.STRING,
    primaryKey: true,
    unique: true,
    defaultValue: () => generateId(),
  },
  salesInvoiceNumber: {
    type: DataTypes.STRING,
    unique: false,
  },
  related_id: {
    type: DataTypes.STRING,
    allowNull: false,
  },
  customer: {
    type: DataTypes.STRING,
    allowNull: false,
  },
  issueDate: {
    type: DataTypes.DATE,
    allowNull: false,
  },
  dueDate: {
    type: DataTypes.DATE,
    allowNull: false,
  },
  category: {
    type: DataTypes.STRING,
    allowNull: true,
    defaultValue: null,
  },
  upiLink: {
    type: DataTypes.STRING,
    allowNull: true,
    defaultValue: null,
  },
  items: {
    type: DataTypes.JSON,
    allowNull: false,
  },
  discount: {
    type: DataTypes.INTEGER,
    allowNull: true,
    defaultValue: null,
  },
  tax: {
    type: DataTypes.INTEGER,
    allowNull: true,
    defaultValue: null,
  },
  subtotal: {
    type: DataTypes.INTEGER,
    allowNull: true,
    defaultValue: null,
  },
  total: {
    type: DataTypes.INTEGER,
    allowNull: true,
    defaultValue: null,
  },
  amount: {
    type: DataTypes.INTEGER,
    allowNull: false,
  },
  payment_status: {
    type: DataTypes.ENUM("paid", "unpaid", "partially_paid"),
    allowNull: false,
    defaultValue: "unpaid",
  },
  currency: {
    type: DataTypes.STRING,
    allowNull: false,
  },

  cost_of_goods: {
    type: DataTypes.INTEGER,
    allowNull: false,
    defaultValue: 0,
  },
  profit: {
    type: DataTypes.INTEGER,
    allowNull: false,
    defaultValue: 0,
  },
  profit_percentage: {
    type: DataTypes.INTEGER,
    allowNull: false,
    defaultValue: 0,
  },
  additional_notes: {
    type: DataTypes.TEXT,
    allowNull: true,
    defaultValue: null,
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

// Add hook to automatically generate unique ID and invoice number
SalesInvoice.beforeCreate(async (salesInvoice) => {
  try {
    // Generate unique ID
    let isUnique = false;
    let newId;
    while (!isUnique) {
      newId = generateId();
      const existingSalesInvoice = await SalesInvoice.findOne({
        where: { id: newId },
      });
      if (!existingSalesInvoice) {
        isUnique = true;
      }
    }
    salesInvoice.id = newId;

    // Remove auto-generation of invoice number
    // Let it be set from the frontend
  } catch (error) {
    console.error("Error in beforeCreate hook:", error);
    throw error;
  }
});

// Add hook to validate total amount
SalesInvoice.beforeSave(async (salesInvoice) => {
  // Verify total matches calculations
  const calculatedTotal =
    salesInvoice.subtotal + salesInvoice.tax - salesInvoice.discount;
  if (Math.abs(calculatedTotal - salesInvoice.total) > 0.01) {
    // Allow small floating point differences
    throw new Error("Invoice total does not match calculations");
  }

  // Verify profit calculations
  const calculatedProfit = salesInvoice.total - salesInvoice.cost_of_goods;
  if (Math.abs(calculatedProfit - salesInvoice.profit) > 0.01) {
    throw new Error("Invoice profit does not match calculations");
  }

  // Calculate profit percentage
  if (salesInvoice.cost_of_goods > 0) {
    const calculatedPercentage =
      (salesInvoice.profit / salesInvoice.cost_of_goods) * 100;
    salesInvoice.profit_percentage = parseFloat(
      calculatedPercentage.toFixed(2)
    );
  } else {
    salesInvoice.profit_percentage = 0;
  }
});

export default SalesInvoice;
