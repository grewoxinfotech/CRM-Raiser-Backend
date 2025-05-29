import { DataTypes } from 'sequelize';
import sequelize from '../config/db.js';
import generateId from '../middlewares/generatorId.js';


const Attendance = sequelize.define('Attendance', {
    id: {
        type: DataTypes.STRING,
        primaryKey: true,
        unique: true,
        defaultValue: () => generateId()
    },
    employee: {
        type: DataTypes.STRING,
        allowNull: false
    },
    date: {
        type: DataTypes.DATEONLY,
        allowNull: false
    },
    startTime: {
        type: DataTypes.TIME,
        allowNull: true
    },
    endTime: {
        type: DataTypes.TIME,
        allowNull: true
    },
    late: {
        type: DataTypes.STRING,
        allowNull: true
    },
    halfDay: {
        type: DataTypes.BOOLEAN,
        allowNull: true,
        defaultValue: false
    },
    client_id: {
        type: DataTypes.STRING,
        allowNull: true,
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

Attendance.beforeCreate(async (attendance) => {
    let isUnique = false;
    let newId;
    while (!isUnique) {
        newId = generateId();
        const existingAttendance = await Attendance.findOne({ where: { id: newId } });
        if (!existingAttendance) {
            isUnique = true;
        }
    }
    attendance.id = newId;
});

export default Attendance;