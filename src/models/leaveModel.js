import { DataTypes } from 'sequelize';
import sequelize from '../config/db.js';
import generateId from '../middlewares/generatorId.js';

const Leave = sequelize.define('Leave', {
    id: {
        type: DataTypes.STRING,
        primaryKey: true,
        unique: true,
        defaultValue: () => generateId()
    },
    employeeId: {
        type: DataTypes.STRING,
        allowNull: false
    },
    startDate: {
        type: DataTypes.DATE,
        allowNull: false
    },
    endDate: {
        type: DataTypes.DATE,
        allowNull: false,
    },
    leaveType: {
        type: DataTypes.ENUM('sick', 'casual', 'annual', 'other'),
        allowNull: false
    },
    reason: {
        type: DataTypes.TEXT,
        allowNull: false
    },
    status: {
        type: DataTypes.ENUM('pending', 'approved', 'rejected'),
        defaultValue: 'pending'
    },
    remarks: {
        type: DataTypes.STRING,
        allowNull: true,
        defaultValue: null
    },
    isHalfDay: {
        type: DataTypes.BOOLEAN,
        allowNull: false,
        defaultValue: false
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
    },
});

Leave.beforeCreate(async (leave) => {
    let isUnique = false;
    let newId;
    while (!isUnique) {
        newId = generateId();
        const existingLeave = await Leave.findOne({ where: { id: newId } });
        if (!existingLeave) {
            isUnique = true;
        }
    }
    leave.id = newId;
});

// Validation for half-day leave:
Leave.beforeValidate(async (leave) => {
    if (leave.isHalfDay) {
        if (leave.startDate.getTime() !== leave.endDate.getTime()) {
            throw new Error('Half-day leave must have the same start and end date');
        }
    }
});

export default Leave;