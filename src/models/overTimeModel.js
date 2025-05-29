import { DataTypes } from "sequelize";
import sequelize from "../config/db.js";
import generateId from "../middlewares/generatorId.js";

const OverTime = sequelize.define("overTime", {
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
    days: {
        type: DataTypes.STRING,
        allowNull: false,
    },
    Hours: {
        type: DataTypes.STRING,
        allowNull: false,
    },
    rate: {
        type: DataTypes.STRING,
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

OverTime.beforeCreate(async (overTime) => {
    let isUnique = false;
    let newId;
    while (!isUnique) {
        newId = generateId();
        const existingOverTime = await OverTime.findOne({ where: { id: newId } });
        if (!existingOverTime) {
            isUnique = true;
            overTime.id = newId;
        }
    }
});

export default OverTime;