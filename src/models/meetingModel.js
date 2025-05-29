import { DataTypes } from 'sequelize';
import sequelize from '../config/db.js';
import generateId from '../middlewares/generatorId.js';


const Meeting = sequelize.define('Meeting', {
    id: {
        type: DataTypes.STRING,
        primaryKey: true,
        unique: true,
        defaultValue: () => generateId()
    },
    title: {
        type: DataTypes.STRING,
        allowNull: false
    },
    description: {
        type: DataTypes.TEXT,
        allowNull: true
    },
    department: {
        type: DataTypes.STRING,
        allowNull: false
    },
    employee: {
        type: DataTypes.JSON,
        allowNull: true,
    },
    date: {
        type: DataTypes.DATE,
        allowNull: false
    },
    startTime: {
        type: DataTypes.TIME,
        allowNull: false
    },
    endTime: {
        type: DataTypes.TIME,
        allowNull: true
    },
    meetingLink: {
        type: DataTypes.STRING,
        allowNull: true
    },
    client: {
        type: DataTypes.STRING,
        allowNull: true,
        defaultValue: null
    },
    status: {
        type: DataTypes.ENUM('scheduled', 'completed', 'cancelled'),
        defaultValue: 'scheduled'
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

Meeting.beforeCreate(async (meeting) => {
    let isUnique = false;
    let newId;
    while (!isUnique) {
        newId = generateId();
        const existingMeeting = await Meeting.findOne({
            where: { id: newId }
        });
        if (!existingMeeting) {
            isUnique = true;
        }
    }
    meeting.id = newId;
});

export default Meeting;




