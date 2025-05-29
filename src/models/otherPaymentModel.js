import { DataTypes } from "sequelize";
import sequelize from "../config/db.js";
import generateId from "../middlewares/generatorId.js";

const OtherPayment = sequelize.define("otherPayment", {
    id: {
        type: DataTypes.STRING,
        allowNull: false,
        primaryKey: true,
        unique: true,
        defaultValue: () => generateId(),
    },
    employeeId: {
        type: DataTypes.STRING,
        allowNull: false,
    },
    title: {
        type: DataTypes.STRING,
        allowNull: false,
    },
    type: {
        type: DataTypes.STRING,
        allowNull: false,
    },
    currency: {
        type: DataTypes.STRING,
        allowNull: false,
    },
    amount: {
        type: DataTypes.INTEGER,
        allowNull: false,
    },
    client_id: {
        type: DataTypes.STRING,
        allowNull: false
    },
    created_by: {
        type: DataTypes.STRING,
        allowNull: true,
        defaultValue: null
    },
    updated_by: {
        type: DataTypes.STRING,
        allowNull: true,
        defaultValue: null
    },
});

OtherPayment.beforeCreate(async (otherPayment) => {
    let isUnique = false;
    let newId;
    while (!isUnique) {
        newId = generateId();
        const existingOtherPayment = await OtherPayment.findOne({ where: { id: newId } });
        if (!existingOtherPayment) {
            isUnique = true;
            otherPayment.id = newId;
        }
    }
});

export default OtherPayment;