import { DataTypes } from "sequelize";
import sequelize from "../config/db.js";
import generateId from "../middlewares/generatorId.js";

const JobCategory = sequelize.define("JobCategory", {
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

JobCategory.beforeCreate(async (jobCategory) => {
    let isUnique = false;
    let newId;
    while (!isUnique) {
        newId = generateId();
        const existingJobCategory = await JobCategory.findOne({ where: { id: newId } });
        if (!existingJobCategory) {
            isUnique = true;
        }
    }
    jobCategory.id = newId;
});

export default JobCategory;