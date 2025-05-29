import { DataTypes } from "sequelize";
import sequelize from "../config/db.js";
import generateId from '../middlewares/generatorId.js';

const Feature = sequelize.define('feature', {
    id: {
        type: DataTypes.STRING,
        allowNull: false,
        unique: true,
        primaryKey: true,
        defaultValue: () => generateId(),
    },
    featureName: {
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

Feature.beforeCreate(async (feature) => {
    let isUnique = false;
    let newId;
    while (!isUnique) {
        newId = generateId();
        const existingFeature = await Feature.findOne({
            where: { id: newId }
        });
        if (!existingFeature) {
            isUnique = true;
        }
    }
    feature.id = newId;
});

export default Feature;