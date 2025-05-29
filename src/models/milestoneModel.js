import { DataTypes } from "sequelize";
import sequelize from "../config/db.js";
import generateId from "../middlewares/generatorId.js";

const Milestone = sequelize.define("milestone", {
    id: {
        type: DataTypes.STRING,
        primaryKey: true,
        unique: true,
        defaultValue: () => generateId(),
    },
    related_id: {
        type: DataTypes.STRING,
        allowNull: true
    },
    milestone_title: {
        type: DataTypes.STRING,
        allowNull: true
    },
    milestone_status: {
        type: DataTypes.STRING,
        allowNull: true
    },
    milestone_cost: {
        type: DataTypes.STRING,
        allowNull: true
    },
    milestone_summary: {
        type: DataTypes.STRING,
        allowNull: true
    },
    milestone_start_date: {
        type: DataTypes.DATE,
        allowNull: true
    },
    add_cost_to_project_budget: {
        type: DataTypes.STRING,
        allowNull: true,
        defaultValue: false
    },
    milestone_end_date: {
        type: DataTypes.DATE,
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

export default Milestone;