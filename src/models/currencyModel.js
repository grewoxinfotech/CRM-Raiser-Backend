import { DataTypes } from "sequelize";
import sequelize from "../config/db.js";
import generateId from '../middlewares/generatorId.js';

const Currency = sequelize.define('currency', {
    id: {
        type: DataTypes.STRING,
        allowNull: false,
        unique: true,
        primaryKey: true,
        defaultValue: () => generateId(),
    },
    currencyName: {
        type: DataTypes.STRING,
        allowNull: false,
        unique: true
    },
    currencyIcon: {
        type: DataTypes.STRING,
        allowNull: false,
    },
    currencyCode: {
        type: DataTypes.STRING,
        allowNull: false,
        unique: true
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

Currency.beforeCreate(async (currency) => {
    let isUnique = false;
    let newId;
    while (!isUnique) {
        newId = generateId();
        const existingCurrencies = await Currency.findOne({ where: { id: newId } });
        if (!existingCurrencies) {
            isUnique = true;
        }
    }
    currency.id = newId;
});

export default Currency;