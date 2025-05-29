import { DataTypes } from "sequelize";
import sequelize from "../config/db.js";
import generateId from '../middlewares/generatorId.js';

export const Tax = sequelize.define("Tax", {
    id: {
        type: DataTypes.STRING,
        allowNull: false,
        unique: true,
        primaryKey: true,
        defaultValue: () => generateId(),
    },
    gstName: {
        type: DataTypes.STRING,
        allowNull: false,
        unique: true
    },
    gstPercentage: {
        type: DataTypes.STRING,
        allowNull: false,
        unique: true
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
    }
});

Tax.beforeCreate(async (tax) => {
    let isUnique = false;
    let newId;
    while (!isUnique) {
        newId = generateId();
        const existingTax = await Tax.findOne({ where: { id: newId } });
        if (!existingTax) {
            isUnique = true;
        }
    }
    tax.id = newId;
});

export default Tax;