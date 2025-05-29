import { DataTypes } from "sequelize";
import sequelize from "../config/db.js";
import generateId from "../middlewares/generatorId.js";

const Lead = sequelize.define('Lead', {
    id: {
        type: DataTypes.STRING,
        primaryKey: true,
        unique: true,
        defaultValue: () => generateId()
    },
    inquiry_id: {
        type: DataTypes.STRING,
        allowNull: true,
        defaultValue: null
    },
    leadTitle: {
        type: DataTypes.STRING,
        allowNull: false,
    },
    leadStage: {
        type: DataTypes.STRING,
        allowNull: true,
    },
    pipeline: {
        type: DataTypes.STRING,
        allowNull: true,
    },
    currency: {
        type: DataTypes.STRING,
        allowNull: false,
    },
    leadValue: {
        type: DataTypes.INTEGER,
        allowNull: false,
    },
    company_id: {
        type: DataTypes.STRING,
        allowNull: true,
        defaultValue: null
    },
    contact_id: {
        type: DataTypes.STRING,
        allowNull: true,
        defaultValue: null
    },
    lead_members: {
        type: DataTypes.JSON,
        allowNull: true,
        defaultValue: null
    },
    source: {
        type: DataTypes.STRING,
        allowNull: true,
        defaultValue: null
    },
    category: {
        type: DataTypes.STRING,
        allowNull: true,
        defaultValue: null
    },
    files: {
        type: DataTypes.JSON,
        allowNull: true,
        defaultValue: null
    },
    status: {
        type: DataTypes.STRING,
        allowNull: true,
        defaultValue: null
    },
    interest_level: {
        type: DataTypes.ENUM('high', 'medium', 'low'),
        allowNull: true,
        defaultValue: null
    },
    lead_score: {
        type: DataTypes.INTEGER,
        allowNull: true,
        defaultValue: null,
        validate: {
            min: 1,
            max: 100
        },
        comment: 'Lead score as a percentage value (1-100%)'
    },
    is_converted: {
        type: DataTypes.BOOLEAN,
        allowNull: true,
        defaultValue: false
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

Lead.beforeCreate(async (lead) => {
    let isUnique = false;
    let newId;
    while (!isUnique) {
        newId = generateId();
        const existingLead = await Lead.findOne({ where: { id: newId } });
        if (!existingLead) {
            isUnique = true;
        }
    }
    lead.id = newId;
});

export default Lead;
