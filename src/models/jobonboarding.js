import { DataTypes } from "sequelize";
import sequelize from "../config/db.js";
import generateId from "../middlewares/generatorId.js";

const JobOnboarding = sequelize.define('JobOnboarding', {
    id: {
        type: DataTypes.STRING,
        allowNull: false,
        unique: true,
        primaryKey: true,
        defaultValue: () => generateId(),
    },
    Interviewer: {
        type: DataTypes.STRING,
        allowNull: true
    },
    JoiningDate: {
        type: DataTypes.STRING,
        allowNull: false
    },
    DaysOfWeek: {
        type: DataTypes.STRING,
        allowNull: true
    },
    Salary: {
        type: DataTypes.STRING,
        allowNull: true
    },
    Currency: {
        type: DataTypes.STRING,
        allowNull: true
    },
    SalaryType: {
        type: DataTypes.STRING,
        allowNull: false
    },
    SalaryDuration: {
        type: DataTypes.STRING,
        allowNull: true
    },
    JobType: {
        type: DataTypes.STRING,
        allowNull: false
    },
    Status: {
        type: DataTypes.STRING,
        allowNull: true
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
JobOnboarding.beforeCreate(async (jobOnboarding) => {
    let isUnique = false;
    let newId;
    while (!isUnique) {
        newId = generateId();
        const existingTag = await JobOnboarding.findOne({
            where: { id: newId }
        });
        if (!existingTag) {
            isUnique = true;
        }
    }
    jobOnboarding.id = newId;
});
export default JobOnboarding;