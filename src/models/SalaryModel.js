import { DataTypes } from "sequelize";
import sequelize from "../config/db.js";
import generateId from "../middlewares/generatorId.js";

const Salary = sequelize.define("Salary", {
  id: {
    type: DataTypes.STRING,
    primaryKey: true,
    unique: true,
    allowNull: false,
    defaultValue: () => generateId(),
  },
  employeeId: {
    type: DataTypes.STRING,
    allowNull: false,
  },
  payslipType: {
    type: DataTypes.STRING,
    allowNull: false,
  },
  currency: {
    type: DataTypes.STRING,
    allowNull: false,
  },
  salary: {
    type: DataTypes.STRING,
    allowNull: false,
  },
  netSalary: {
    type: DataTypes.INTEGER,
    allowNull: false,
  },
  status: {
    type: DataTypes.ENUM("paid", "unpaid"),
    allowNull: false,
    defaultValue: "unpaid",
  },
  paymentDate: {
    type: DataTypes.DATE,
    allowNull: true,
  },
  bankAccount: {
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

Salary.beforeCreate(async (salary) => {
  let isUnique = false;
  let newId;
  while (!isUnique) {
    newId = generateId();
    const existingSalary = await Salary.findOne({ where: { id: newId } });
    if (!existingSalary) {
      isUnique = true;
    }
  }
  salary.id = newId;
});

export default Salary;
