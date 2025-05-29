import { DataTypes } from "sequelize";
import sequelize from "../config/db.js";
import generateId from "../middlewares/generatorId.js";

const JobApplication = sequelize.define('job_application', {
    id: {
        type: DataTypes.STRING,
        allowNull: false,
        unique: true,
        primaryKey: true,
        defaultValue: () => generateId(),
    },
    job: {
        type: DataTypes.STRING,
        allowNull: false
    },
    phoneCode: {
        type: DataTypes.STRING,
        allowNull: false
    },
    name: {
        type: DataTypes.STRING,
        allowNull: false
    },
    cv_path: {
        type: DataTypes.STRING,
        allowNull: true,
        defaultValue: null
    },
    email: {
        type: DataTypes.STRING,
        allowNull: false
    },
    phone: {
        type: DataTypes.STRING,
        allowNull: false
    },
    location: {
        type: DataTypes.STRING,
        allowNull: false
    },
    total_experience: {
        type: DataTypes.STRING,
        allowNull: false
    },
    current_location: {
        type: DataTypes.STRING,
        allowNull: false
    },
    notice_period: {
        type: DataTypes.STRING,
        allowNull: false
    },
    status: {
        type: DataTypes.STRING,
        // defaultValue: "active",
        allowNull: false
    },
    applied_source: {
        type: DataTypes.STRING,
        allowNull: false
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


JobApplication.beforeCreate(async (jobApplication) => {
    let isUnique = false;
    let newId;
    while (!isUnique) {
        newId = generateId();
        const existingJobApplication = await JobApplication.findOne({
            where: { id: newId }
        });
        if (!existingJobApplication) {
            isUnique = true;
        }
    }
    jobApplication.id = newId;
});

export default JobApplication;