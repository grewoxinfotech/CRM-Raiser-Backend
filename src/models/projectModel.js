import { DataTypes } from "sequelize";
import sequelize from "../config/db.js";
import generateId from "../middlewares/generatorId.js";

const Project = sequelize.define("Project", {
    id: {
        type: DataTypes.STRING,
        primaryKey: true,
        unique: true,
    },
    project_name: {
        type: DataTypes.STRING,
        allowNull: true,
        unique: true
    },
    startDate: {
        type: DataTypes.DATE,
        allowNull: false
    },
    endDate: {
        type: DataTypes.DATE,
        allowNull: false
    },
    project_members: {
        type: DataTypes.JSON,
        allowNull: true,
        defaultValue: null
    },
    project_category: {
        type: DataTypes.STRING,
        allowNull: true,
        defaultValue: null
    },
    project_description: {
        type: DataTypes.TEXT,
        allowNull: true
    },
    client: {
        type: DataTypes.STRING,
        allowNull: true
    },
    currency: {
        type: DataTypes.STRING,
        allowNull: true,
        defaultValue: null
    },
    budget: {
        type: DataTypes.INTEGER,
        allowNull: false
    },
    estimatedmonths: {
        type: DataTypes.STRING,
        allowNull: true,
        defaultValue: null
    },
    estimatedhours: {
        type: DataTypes.INTEGER,
        allowNull: true,
        defaultValue: null
    },
    files: {
        type: DataTypes.JSON,
        allowNull: true,
        defaultValue: null
    },
    tag: {
        type: DataTypes.STRING,
        allowNull: true,
        defaultValue: null
    },
    status: {
        type: DataTypes.STRING,
        allowNull: true,
        defaultValue: null
    },
    client_id: {
        type: DataTypes.STRING,
        allowNull: true,
        defaultValue: null
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

Project.beforeCreate(async (project) => {
    let isUnique = false;
    let newId;
    while (!isUnique) {
        newId = generateId();
        const existingProject = await Project.findOne({
            where: { id: newId }
        });
        if (!existingProject) {
            isUnique = true;
        }
    }
    project.id = newId;
});
export default Project;