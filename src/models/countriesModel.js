import { DataTypes } from "sequelize";
import sequelize from "../config/db.js";
import generateId from '../middlewares/generatorId.js';

export const Countries = sequelize.define("Countries", {
    id: {
        type: DataTypes.STRING,
        allowNull: false,
        unique: true,
        primaryKey: true,
        defaultValue: () => generateId(),
    },
    countryName: {
        type: DataTypes.STRING,
        allowNull: false,
        unique: true
    },
    countryCode: {
        type: DataTypes.STRING,
        allowNull: false,
        unique: true
    },
    phoneCode: {
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

Countries.beforeCreate(async (countries) => {
    let isUnique = false;
    let newId;
    while (!isUnique) {
        newId = generateId();
        const existingCountries = await Countries.findOne({ where: { id: newId } });
        if (!existingCountries) {
            isUnique = true;
        }
    }
    countries.id = newId;
});

export default Countries;