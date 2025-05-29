import { DataTypes } from "sequelize";
import sequelize from "../config/db.js";
import generateId from "../middlewares/generatorId.js";

const Job = sequelize.define('job', {
    id: {
        type: DataTypes.STRING,
        allowNull: false,
        unique: true,
        primaryKey: true,
        defaultValue: () => generateId(),
    },
    title: {
        type: DataTypes.STRING,
        allowNull: false
    },
    category: {
        type: DataTypes.STRING,
        allowNull: false
    },
    skills: {
        type: DataTypes.JSON,
        allowNull: false
    },
    location: {
        type: DataTypes.STRING,
        allowNull: false
    },
    interviewRounds: {
        type: DataTypes.JSON,
        allowNull: false
    },
    startDate: {
        type: DataTypes.DATE,
        allowNull: false
    },
    endDate: {
        type: DataTypes.DATE,
        allowNull: false
    },
    totalOpenings: {
        type: DataTypes.INTEGER,
        allowNull: true
    },
    status: {
        type: DataTypes.STRING,
        allowNull: false
    },
    recruiter: {
        type: DataTypes.STRING,
        allowNull: false
    },
    jobType: {
        type: DataTypes.STRING,
        allowNull: true
    },
    workExperience: {
        type: DataTypes.STRING,
        allowNull: true
    },
    currency: {
        type: DataTypes.STRING,
        allowNull: false
    },
    expectedSalary: {
        type: DataTypes.STRING,
        allowNull: true
    },
    description: {
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
Job.beforeCreate(async (job) => {
    let isUnique = false;
    let newId;
    while (!isUnique) {
        newId = generateId();
        const existingJob = await Job.findOne({
            where: { id: newId }
        });
        if (!existingJob) {
            isUnique = true;
        }
    }
    job.id = newId;
});

export default Job;
