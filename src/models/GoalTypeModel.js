import { DataTypes } from 'sequelize';
import sequelize from '../config/db.js';
import generateId from '../middlewares/generatorId.js';

const GoalType = sequelize.define('GoalType', {
    id: {
        type: DataTypes.STRING,
        primaryKey: true,
        unique: true,
        allowNull: false,
        defaultValue: () => generateId()
    },
    name: {
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

GoalType.beforeCreate(async (goalType) => {
    let isUnique = false;
    let newId;
    while (!isUnique) {
        newId = generateId();
        const existingGoalType = await GoalType.findOne({ where: { id: newId } });
        if (!existingGoalType) {
            isUnique = true;
        }
    }
    goalType.id = newId;
});

export default GoalType;