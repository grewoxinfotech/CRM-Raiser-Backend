import { DataTypes } from "sequelize";
import sequelize from "../config/db.js";
import generateId from '../middlewares/generatorId.js';

const TaskCalendar = sequelize.define('taskcalendar', {
    id: {
        type: DataTypes.STRING,
        allowNull: false,
        defaultValue: () => generateId(),
        unique: true,
        primaryKey: true
    },
    taskName: {
        type: DataTypes.STRING,
        allowNull: false,
        // unique: true
    },

    taskDate: {
        type: DataTypes.DATE,
        allowNull: false
    },
    taskTime: {
        type: DataTypes.STRING,
        allowNull: false
    },
    taskType: {
        type: DataTypes.STRING,
        allowNull: false
    },
    taskDescription: {
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

});

TaskCalendar.beforeCreate(async (taskCalendar) => {
    let isUnique = false;
    let newId;
    while (!isUnique) {
        newId = generateId();
        const existingTaskCalendar = await TaskCalendar.findOne({ where: { id: newId } });
        if (!existingTaskCalendar) {
            isUnique = true;
        }
    }
    taskCalendar.id = newId;
});

export default TaskCalendar;