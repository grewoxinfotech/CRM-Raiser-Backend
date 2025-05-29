import { DataTypes } from "sequelize";
import sequelize from "../config/db.js";
import generateId from "../middlewares/generatorId.js";
const Setting = sequelize.define("Setting", {
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
  companyName: {
    type: DataTypes.STRING,
    allowNull: false,
  },
  title: {
    type: DataTypes.STRING,
    allowNull: true,
    defaultValue: null,
  },
  companylogo: {
    type: DataTypes.STRING,
    allowNull: false,
  },
  favicon: {
    type: DataTypes.STRING,
    allowNull: true,
    defaultValue: null,
  },
  merchant_name: {
    type: DataTypes.STRING,
    allowNull: true,
    defaultValue: null,
  },
  merchant_upi_id: {
    type: DataTypes.STRING,
    allowNull: true,
    defaultValue: null,
  },
  bank_name: {
    type: DataTypes.STRING,
    allowNull: true,
    defaultValue: null,
  },
  account_holder_name: {
    type: DataTypes.STRING,
    allowNull: true,
    defaultValue: null,
  },
  account_number: {
    type: DataTypes.STRING,
    allowNull: true,
    defaultValue: null,
  },
  ifsc_code: {
    type: DataTypes.STRING,
    allowNull: true,
    defaultValue: null,
  },
  bank_branch: {
    type: DataTypes.STRING,
    allowNull: true,
    defaultValue: null,
  },
  termsandconditions: {
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
  },
  updated_by: {
    type: DataTypes.STRING,
    allowNull: true,
  },
});

Setting.beforeCreate(async (setting) => {
  let isUnique = false;
  let newId;
  while (!isUnique) {
    newId = generateId();
    const existingSetting = await Setting.findOne({ where: { id: newId } });
    if (!existingSetting) {
      isUnique = true;
    }
  }
  setting.id = newId;
});
export default Setting;
