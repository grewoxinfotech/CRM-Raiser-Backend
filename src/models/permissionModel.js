import { DataTypes } from 'sequelize';
import sequelize from '../config/db.js';
import generateId from '../middlewares/generatorId.js';

const Permission = sequelize.define('Permission', {
    id: {
        type: DataTypes.STRING,
        primaryKey: true,
        unique: true,
        defaultValue: () => generateId()
    },
    permissions: {
        type: DataTypes.JSON,
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
    }
});

Permission.beforeCreate(async (permission) => {
    let isUnique = false;
    let newId;
    while (!isUnique) {
        newId = generateId();
        const existingPermission = await Permission.findOne({
            where: { id: newId }
        });
        if (!existingPermission) {
            isUnique = true;
        }
    }
    permission.id = newId;
});

export default Permission;
