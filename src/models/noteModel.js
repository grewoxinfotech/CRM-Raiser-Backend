import { DataTypes } from "sequelize";
import sequelize from "../config/db.js";
import generateId from "../middlewares/generatorId.js";

const Note = sequelize.define("note", {
    id: {
        type: DataTypes.STRING,
        unique: true,
        primaryKey: true,
        defaultValue: () => generateId(),
    },
    related_id: {
        type: DataTypes.STRING,
        allowNull: false
    },
    note_title: {
        type: DataTypes.STRING,
        allowNull: false
    },
    notetype: {
        type: DataTypes.STRING,
        allowNull: true,
        defaultValue: null
    },
    employees: {
        type: DataTypes.JSON,
        allowNull: true,
        defaultValue: null
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

    },
});

export default Note;