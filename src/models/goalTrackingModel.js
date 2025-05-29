import { DataTypes } from "sequelize";
import sequelize from "../config/db.js";
import generateId from '../middlewares/generatorId.js';

const GoalTracking = sequelize.define('goal_tracking', {
    id: {
        type: DataTypes.STRING,
        allowNull: false,
        unique: true,
        primaryKey: true,
        defaultValue: () => generateId(),
    },
    branch: {
        type: DataTypes.STRING,
        allowNull: false
    },
    goalType: {
        type: DataTypes.STRING,
        allowNull: false
    },
    startDate: {
        type: DataTypes.DATE,
        allowNull: false
    },
    endDate: {
        type: DataTypes.DATE,
        allowNull: false
    },
    status: {
        type: DataTypes.STRING,
        allowNull: false
    },
    target_achievement: {
        type: DataTypes.STRING,
        allowNull: false
    },
    description: {
        type: DataTypes.STRING,
        allowNull: false
    },
    rating: {
        type: DataTypes.STRING,
        allowNull: false
    },
    progress: {
        type: DataTypes.STRING,
        allowNull: true,
        defaultValue: null
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

GoalTracking.beforeCreate(async (goalTracking) => {
    let isUnique = false;
    let newId;
    while (!isUnique) {
        newId = generateId();
        const existingGoalTracking = await GoalTracking.findOne({ where: { id: newId } });
        if (!existingGoalTracking) {
            isUnique = true;
        }
    }
    goalTracking.id = newId;
});

export default GoalTracking;
