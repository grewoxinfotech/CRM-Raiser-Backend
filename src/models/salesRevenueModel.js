import { DataTypes } from "sequelize";
import sequelize from "../config/db.js";
import generateId from "../middlewares/generatorId.js";

const SalesRevenue = sequelize.define("sales_Revenue", {
  id: {
    type: DataTypes.STRING,
    allowNull: false,
    unique: true,
    primaryKey: true,
    defaultValue: () => generateId(),
  },
  related_id: {
    type: DataTypes.STRING,
    allowNull: false,
  },
  date: {
    type: DataTypes.DATE,
    allowNull: false,
  },
  currency: {
    type: DataTypes.STRING,
    allowNull: true,
  },
  amount: {
    type: DataTypes.FLOAT,
    allowNull: false,
  },
  cost_of_goods: {
    type: DataTypes.FLOAT,
    allowNull: false,
    defaultValue: 0,
  },
  profit: {
    type: DataTypes.VIRTUAL,
    get() {
      return this.amount - this.cost_of_goods;
    },
  },
  profit_margin_percentage: {
    type: DataTypes.VIRTUAL,
    get() {
      if (this.cost_of_goods === 0) return 0;
      return ((this.amount - this.cost_of_goods) / this.cost_of_goods) * 100;
    },
  },
  products: {
    type: DataTypes.JSON,
    allowNull: true,
    defaultValue: [],
    get() {
      const rawValue = this.getDataValue("products");
      return rawValue ? JSON.parse(rawValue) : [];
    },
    set(value) {
      this.setDataValue("products", JSON.stringify(value));
    },
  },
  account: {
    type: DataTypes.STRING,
    allowNull: false,
  },
  customer: {
    type: DataTypes.STRING,
    allowNull: false,
  },
  description: {
    type: DataTypes.STRING,
    allowNull: true,
    defaultValue: null,
  },
  salesInvoiceNumber: {
    type: DataTypes.STRING,
    allowNull: true,
    defaultValue: null,
    unique: true,
  },
  category: {
    type: DataTypes.STRING,
    allowNull: false,
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

SalesRevenue.beforeCreate(async (salesRevenue) => {
  let isUnique = false;
  let newId;
  while (!isUnique) {
    newId = generateId();
    const existingSalesRevenue = await SalesRevenue.findOne({
      where: { id: newId },
    });
    if (!existingSalesRevenue) {
      isUnique = true;
    }
  }
  salesRevenue.id = newId;
});

export default SalesRevenue;
