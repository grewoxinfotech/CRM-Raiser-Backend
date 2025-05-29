import sequelize from "../config/db.js";
import { DataTypes } from "sequelize";
import generateId from "../middlewares/generatorId.js";

const Payroll = sequelize.define('payroll', {
    id: {
        type: DataTypes.STRING,
        allowNull: false,
        primaryKey: true,
        defaultValue: generateId
    },
});

export default Payroll;