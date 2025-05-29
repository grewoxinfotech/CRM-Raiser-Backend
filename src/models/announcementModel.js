import { DataTypes } from "sequelize";
import sequelize from "../config/db.js";
import generateId from "../middlewares/generatorId.js";

const Announcement = sequelize.define('Announcement', {
    id: {
        type: DataTypes.STRING,
        primaryKey: true,
        unique: true,
        defaultValue: () => generateId()
    },
    title: {
        type: DataTypes.STRING,
        allowNull: false
    },
    description: {
        type: DataTypes.STRING,
        allowNull: false
    },
    branch: {
        type: DataTypes.JSON,
        allowNull: true,
        defaultValue: null
    },
    time: {
        type: DataTypes.STRING,
        allowNull: false
    },
    date: {
        type: DataTypes.STRING,
        allowNull: false
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
})

Announcement.beforeCreate(async (announcement) => {
    let isUnique = false;
    let newId;
    while (!isUnique) {
        newId = generateId();
        const existingAnnouncement = await Announcement.findOne({ where: { id: newId } });
        if (!existingAnnouncement) {
            isUnique = true;
        }
    }
    announcement.id = newId;
});

export default Announcement;