import { DataTypes } from "sequelize";
import sequelize from "../config/db.js";
import generateId from "../middlewares/generatorId.js";

const JobStages = sequelize.define("JobStages", {
    id: {
        type: DataTypes.STRING,
        primaryKey: true,
        unique: true,
        allowNull: false,
        defaultValue: () => generateId()
    },
    title: {
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
    },
});

JobStages.beforeCreate(async (jobStages) => {
    let isUnique = false;
    let newId;
    while (!isUnique) {
        newId = generateId();
        const existingJobStages = await JobStages.findOne({ where: { id: newId } });
        if (!existingJobStages) {
            isUnique = true;
        }
    }
    jobStages.id = newId;
});

export default JobStages;