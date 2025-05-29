import { DataTypes } from 'sequelize';
import sequelize from '../config/db.js';
import generateId from '../middlewares/generatorId.js';

const LeaveType = sequelize.define('LeaveType', {
    id: {
        type: DataTypes.STRING,
        primaryKey: true,
        unique: true,
        allowNull: false,
        defaultValue: () => generateId()
    },
    leaveType: {
        type: DataTypes.STRING,
        allowNull: false,
        unique: true
    },
    daysPerYear: {
        type: DataTypes.INTEGER,
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

LeaveType.beforeCreate(async (leaveType) => {
    let isUnique = false;
    let newId;
    while (!isUnique) {
        newId = generateId();
        const existingLeaveType = await LeaveType.findOne({ where: { id: newId } });
        if (!existingLeaveType) {
            isUnique = true;
        }
    }
    leaveType.id = newId;
});

export default LeaveType;