import { DataTypes } from "sequelize";
import sequelize from "../config/db.js";
import generateId from "../middlewares/generatorId.js";

const ProjectReport = sequelize.define("ProjectReport", {
    id: {
        type: DataTypes.STRING,
        primaryKey: true,
        unique: true,
        defaultValue: () => generateId()
    },
    project: {
        type: DataTypes.STRING,
        allowNull: false
    },
    startdate: {
        type: DataTypes.DATE,
        allowNull: false
    },
    enddate: {
        type: DataTypes.DATE,
        allowNull: false
    },
    projectMembers: {
        type: DataTypes.JSON,
        allowNull: false
    },
    completion: {
        type: DataTypes.STRING,
        allowNull: false
    },
    status: {
        type: DataTypes.ENUM("in-progress", "on-hold", "completed", "cancelled"),
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

ProjectReport.beforeCreate(async (projectReport) => {
    let isUnique = false;
    let newId;
    while (!isUnique) {
        newId = generateId();
        // Check if this ID already exists
        const existingProjectReport = await ProjectReport.findOne({
            where: { id: newId }
        });
        if (!existingProjectReport) {
            isUnique = true;
        }
    }
    projectReport.id = newId;
});

export default ProjectReport;
