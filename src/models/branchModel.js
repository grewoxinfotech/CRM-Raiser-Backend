import { DataTypes } from "sequelize";
import sequelize from "../config/db.js";
import generateId from "../middlewares/generatorId.js";

const Branch = sequelize.define('branch', {
    id: {
        type: DataTypes.STRING,
        allowNull: false,
        primaryKey: true,
        unique: true,
        defaultValue: () => generateId(),
    },
    branchName: {
        type: DataTypes.STRING,
        allowNull: false
    },
    branchAddress: {
        type: DataTypes.STRING,
        allowNull: false
    },
    branchManager: {
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
});

Branch.beforeCreate(async (branch) => {
    let isUnique = false;
    let newId;
    while (!isUnique) {
        newId = generateId();
        const existingBranch = await Branch.findOne({ where: { id: newId } });
        if (!existingBranch) {
            isUnique = true;
        }
    }
    branch.id = newId;
})

export default Branch;