import { DataTypes } from 'sequelize';
import sequelize from '../config/db.js';
import generateId from '../middlewares/generatorId.js';

const Role = sequelize.define('Role', {
    id: {
        type: DataTypes.STRING,
        primaryKey: true,
        unique: true,
        defaultValue: () => generateId()
    },
    role_name: {
        type: DataTypes.STRING,
        allowNull: false,
        // unique: true
    },
    permissions: {
        type: DataTypes.JSON,
        allowNull: true,
        defaultValue: null
    },
    client_id: {
        type: DataTypes.STRING,
        allowNull: true,
        defaultValue: null
    },
    // client_plan_id: {
    //     type: DataTypes.STRING,
    //     allowNull: true,
    //     defaultValue: null
    // },
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

Role.beforeCreate(async (role) => {
    let isUnique = false;
    let newId;
    while (!isUnique) {
        newId = generateId();
        const existingRole = await Role.findOne({ where: { id: newId } });
        if (!existingRole) {
            isUnique = true;
        }
    }
    role.id = newId;
});

export default Role;