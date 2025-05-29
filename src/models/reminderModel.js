import { DataTypes } from 'sequelize';
import sequelize from '../config/db.js';
import generateId from '../middlewares/generatorId.js';

const Reminder = sequelize.define('reminder', {
    id: {
        type: DataTypes.STRING,
        primaryKey: true,
        unique: true,
        allowNull: false,
        defaultValue: () => generateId(),
    },
    start_date: {
        type: DataTypes.DATE,
        allowNull: false,
    },
    users: {
        type: DataTypes.JSON,
        allowNull: false,
    },
    description: {
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

export default Reminder;