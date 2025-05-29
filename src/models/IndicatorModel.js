import { DataTypes } from 'sequelize';
import sequelize from '../config/db.js';
import generateId from '../middlewares/generatorId.js';

const Indicator = sequelize.define('indicator', {
    id: {
        type: DataTypes.STRING,
        primaryKey: true,
        unique: true,
        allowNull: false,
        defaultValue: () => generateId(),
    },
    branch: {
        type: DataTypes.STRING,
        allowNull: false,
    },
    department: {
        type: DataTypes.STRING,
        allowNull: false,
    },
    designation: {
        type: DataTypes.STRING,
        allowNull: false,
    },
    businessProcess: {
        type: DataTypes.INTEGER,
        allowNull: false,
    },
    oralCommunication: {
        type: DataTypes.INTEGER,
        allowNull: false,
    },
    leadership: {
        type: DataTypes.INTEGER,
        allowNull: false,
    },
    projectManagement: {
        type: DataTypes.INTEGER,
        allowNull: false,
    },
    allocatingResources: {
        type: DataTypes.INTEGER,
        allowNull: false,
    },
    overallRating: {
        type: DataTypes.INTEGER,
        allowNull: false,
        validate: {
            max: 5,
            min: 0
        }
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

export default Indicator