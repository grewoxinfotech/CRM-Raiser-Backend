import { DataTypes } from "sequelize";
import sequelize from "../config/db.js";
import generateId from "../middlewares/generatorId.js";

const Policy = sequelize.define('policy', {
    id: {
        type: DataTypes.STRING,
        allowNull: false,
        unique: true,
        primaryKey: true,
        defaultValue: () => generateId(),
    },
  
    title: {
        type: DataTypes.STRING,
        allowNull: false
    },
    description: {
        type: DataTypes.TEXT,
        allowNull: false
    },
    file: {
        type: DataTypes.STRING,
        allowNull: true,
        defaultValue: null
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

Policy.beforeCreate(async (policy) => {
    let isUnique = false;
    let newId;
    while (!isUnique) {
        newId = generateId();
        const existingPolicy = await Policy.findOne({ where: { id: newId } });
        if (!existingPolicy) {
            isUnique = true;
        }
    }
    policy.id = newId;
});

export default Policy;
