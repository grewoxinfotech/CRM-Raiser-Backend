import { DataTypes } from "sequelize";
import sequelize from "../config/db.js";
import generateId from '../middlewares/generatorId.js';

const InterviewSchedule = sequelize.define('interview_schedule', {
    id: {
        type: DataTypes.STRING,
        allowNull: false,
        unique: true,
        primaryKey: true,
        defaultValue: () => generateId(),
    },
    job: {
        type: DataTypes.STRING,
        allowNull: false,
    },
    candidate: {
        type: DataTypes.STRING,
        allowNull: false,
    },
    interviewer: {
        type: DataTypes.STRING,
        allowNull: false,
    },
    round: {
        type: DataTypes.JSON,
        allowNull: false,
    },
    interviewType: {
        type: DataTypes.STRING,
        allowNull: false,
    },
    startOn: {
        type: DataTypes.DATE,
        allowNull: false,
    },
    startTime: {
        type: DataTypes.TIME,
        allowNull: false,
    },
    commentForInterviewer: {
        type: DataTypes.STRING,
        allowNull: true,
        defaultValue: null
    },
    commentForCandidate: {
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

InterviewSchedule.beforeCreate(async (interviewSchedule) => {
    let isUnique = false;
    let newId;
    while (!isUnique) {
        newId = generateId();
        const existingInterviewSchedule = await InterviewSchedule.findOne({
            where: { id: newId }
        });
        if (!existingInterviewSchedule) {
            isUnique = true;
        }
    }
    interviewSchedule.id = newId;
});

export default InterviewSchedule;
