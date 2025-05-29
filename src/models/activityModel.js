import { DataTypes } from "sequelize";
import sequelize from "../config/db.js";
import generateId from "../middlewares/generatorId.js";

const Activity = sequelize.define("activity", {
    id: {
        type: DataTypes.STRING,
        unique: true,
        primaryKey: true,
        defaultValue: () => generateId(),
    },
    related_id: {
        type: DataTypes.STRING,
        allowNull: false,
    },
    activity_from: {
        type: DataTypes.STRING,
        allowNull: false,

    },
    activity_id: {
        type: DataTypes.STRING,
        allowNull: false,
    },
    action: {
        type: DataTypes.STRING,
        allowNull: false,
    },
    performed_by: {
        type: DataTypes.STRING,
        allowNull: false,
    },
    activity_message: {
        type: DataTypes.STRING,
        allowNull: false,
    },
    client_id: {
        type: DataTypes.STRING,
        allowNull: true,
    },
});

Activity.beforeCreate(async (activity) => {
    let isUnique = false;
    let newId;
    while (!isUnique) {
        newId = generateId();
        const existingActivity = await Activity.findOne({ where: { id: newId } });
        if (!existingActivity) {
            isUnique = true;
        }
    }
    activity.id = newId;
});

export default Activity;
