import { DataTypes } from 'sequelize';
import sequelize from '../config/db.js';
import generateId from '../middlewares/generatorId.js';


const FollowupTask = sequelize.define('followup_task', {
    id: {
        type: DataTypes.STRING,
        allowNull: false,
        unique: true,
        primaryKey: true,
        defaultValue: () => generateId(),
    },
    subject: {
        type: DataTypes.STRING,
        allowNull: false,
    },
    due_date: {
        type: DataTypes.DATEONLY,
        allowNull: false,
    },
    priority: {
        type: DataTypes.ENUM('highest', 'high', 'medium', 'low'),
        allowNull: false,
        defaultValue: 'medium',
    },
    task_reporter: {
        type: DataTypes.STRING,
        allowNull: true,
    },
    assigned_to: {
        type: DataTypes.JSON,
        allowNull: false,
    },
    status: {
        type: DataTypes.ENUM('not_started', 'in_progress', 'completed', 'on_hold', 'cancelled'),
        allowNull: false,
        defaultValue: 'not_started',
    },
    reminder: {
        type:DataTypes.JSON,
        allowNull:true,
        defaultValue:null,
    },
            repeat: {
                type:DataTypes.JSON,
                allowNull:true,
                defaultValue:null,
            },
    description: {
        type: DataTypes.TEXT,
        allowNull: true,
    },
    related_id: {
        type: DataTypes.STRING,
        allowNull: false,
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

FollowupTask.beforeCreate(async (followuptask) => {
    let isUnique = false;
    let newId;
    while (!isUnique) {
        newId = generateId();
        const existingFollowupTask = await FollowupTask.findOne({
            where: { id: newId }
        });
        if (!existingFollowupTask) {
            isUnique = true;
        }
    }
    followuptask.id = newId;
});

export default FollowupTask;