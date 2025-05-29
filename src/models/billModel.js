import { DataTypes } from "sequelize";
import sequelize from "../config/db.js";
import generateId from "../middlewares/generatorId.js";

const Bill = sequelize.define("Bill", {
  id: {
    type: DataTypes.STRING,
    primaryKey: true,
    unique: true,
  },
  related_id: {
    type: DataTypes.STRING,
    allowNull: false,
  },
  billNumber: {
    type: DataTypes.STRING,
    unique: false,
  },
  vendor: {
    type: DataTypes.STRING,
    allowNull: false,
  },
  upiLink: {
    type: DataTypes.STRING,
    allowNull: true,
    defaultValue: null,
  },
  billDate: {
    type: DataTypes.DATE,
    allowNull: false,
  },
  discription: {
    type: DataTypes.STRING,
    allowNull: true,
    defaultValue: null,
  },
  subTotal: {
    type: DataTypes.INTEGER,
    allowNull: false,
  },
  currency: {
    type: DataTypes.STRING,
    allowNull: true,
    defaultValue: null,
  },
  items: {
    type: DataTypes.JSON,
    allowNull: false,
  },
  overallDiscountType: {
    type: DataTypes.STRING,
    allowNull: true,
    defaultValue: null,
  },
  overallDiscount: {
    type: DataTypes.INTEGER,
    allowNull: true,
    defaultValue: null,
  },
  overallDiscountAmount: {
    type: DataTypes.INTEGER,
    allowNull: true,
    defaultValue: null,
  },
  overallTax: {
    type: DataTypes.STRING,
    allowNull: true,
    defaultValue: null,
  },
  overallTaxAmount: {
    type: DataTypes.INTEGER,
    allowNull: true,
    defaultValue: null,
  },
  status: {
    type: DataTypes.STRING,
    allowNull: false,
  },
  updated_total: {
    type: DataTypes.INTEGER,
    allowNull: true,
    defaultValue: null,
  },
  bill_status: {
    type: DataTypes.STRING,
    allowNull: true,
    defaultValue: null,
  },
  discount: {
    type: DataTypes.INTEGER,
    allowNull: false,
  },
  tax: {
    type: DataTypes.INTEGER,
    allowNull: false,
  },
  total: {
    type: DataTypes.INTEGER,
    allowNull: false,
  },
  amount: {
    type: DataTypes.INTEGER,
    allowNull: false,
  },
  note: {
    type: DataTypes.STRING,
    allowNull: true,
  },
  client_id: {
    type: DataTypes.STRING,
    allowNull: true,
    defaultValue: null,
  },
  craeted_by: {
    type: DataTypes.STRING,
    allowNull: true,
  },
  updated_by: {
    type: DataTypes.STRING,
    allowNull: true,
  },
});

Bill.beforeCreate(async (bill) => {
  // Generate unique ID
  let isUnique = false;
  let newId;
  while (!isUnique) {
    newId = generateId();
    const existingBill = await Bill.findOne({ where: { id: newId } });
    if (!existingBill) {
      isUnique = true;
    }
  }
  bill.id = newId;
});

export default Bill;
