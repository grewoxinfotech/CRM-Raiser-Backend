import { DataTypes } from "sequelize";
import sequelize from "../config/db.js";
import generateId from "../middlewares/generatorId.js";

const SalesCreditnote = sequelize.define("sales_Creditnote", {
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
  invoice: {
    type: DataTypes.STRING,
    allowNull: false,
  },
  currency: {
    type: DataTypes.STRING,
    allowNull: true,
  },
  amount: {
    type: DataTypes.STRING,
    allowNull: false,
  },
  date: {
    type: DataTypes.DATE,
    allowNull: true,
  },
  description: {
    type: DataTypes.STRING,
    allowNull: true,
    defaultValue: null,
  },
  attachment: {
    type: DataTypes.STRING,
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

SalesCreditnote.beforeCreate(async (salesCreditnote) => {
  let isUnique = false;
  let newId;
  while (!isUnique) {
    newId = generateId();
    const existingSalesCreditnote = await SalesCreditnote.findOne({
      where: { id: newId },
    });
    if (!existingSalesCreditnote) {
      isUnique = true;
    }
  }
  salesCreditnote.id = newId;
});

export default SalesCreditnote;
