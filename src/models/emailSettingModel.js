import { DataTypes } from 'sequelize';
import sequelize from '../config/db.js';
import generateId from '../middlewares/generatorId.js';
import { Op } from 'sequelize';

const EmailSettings = sequelize.define('EmailSettings', {
    id: {
        type: DataTypes.STRING,
        primaryKey: true,
        unique: true,
        allowNull: false,
        defaultValue: () => generateId()
    },
    email: {
        type: DataTypes.STRING,
        allowNull: false,
        validate: {
            isEmail: true
        }
    },
    app_password: {
        type: DataTypes.STRING,
        allowNull: false
    },
    is_default: {
        type: DataTypes.BOOLEAN,
        allowNull: false,
        defaultValue: false
    },
    is_active: {
        type: DataTypes.BOOLEAN,
        allowNull: false,
        defaultValue: true
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

// Add hook for unique ID generation
EmailSettings.beforeCreate(async (settings) => {
    let isUnique = false;
    let newId;
    while (!isUnique) {
        newId = generateId();
        const existingSettings = await EmailSettings.findOne({ where: { id: newId } });
        if (!existingSettings) {
            isUnique = true;
        }
    }
    settings.id = newId;
});

// Add hook to ensure only one default email per client
EmailSettings.beforeSave(async (settings) => {
    if (settings.is_default) {
        await EmailSettings.update(
            { is_default: false },
            { 
                where: { 
                    client_id: settings.client_id,
                    id: { [Op.ne]: settings.id }
                }
            }
        );
    }
});

export default EmailSettings;