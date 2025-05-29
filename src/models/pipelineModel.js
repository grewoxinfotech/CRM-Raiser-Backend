import { DataTypes } from "sequelize";
import sequelize from "../config/db.js";
import generateId from "../middlewares/generatorId.js";

const Pipeline = sequelize.define('pipeline', {
    id: {
        type: DataTypes.STRING,
        allowNull: false,
        unique: true,
        primaryKey: true,
        defaultValue: () => generateId(),
    },
    pipeline_name: {
        type: DataTypes.STRING,
        allowNull: false
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

Pipeline.beforeCreate(async (pipeline) => {
    let isUnique = false;
    let newId;
    while (!isUnique) {
        newId = generateId();
        const existingPipeline = await Pipeline.findOne({
            where: { id: newId }
        });
        if (!existingPipeline) {
            isUnique = true;
        }
    }
    pipeline.id = newId;
});

export default Pipeline;