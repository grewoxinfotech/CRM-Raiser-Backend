import { DataTypes } from "sequelize";
import sequelize from "../config/db.js";
import generateId from "../middlewares/generatorId.js";

const AllowanceOption = sequelize.define("allowanceOption", {
    id: {
        type: DataTypes.STRING,
        allowNull: false,
        primaryKey: true,
        unique: true,
        defaultValue: () => generateId(),
    },
    name: {
        type: DataTypes.STRING,
        allowNull: false,
        unique: true
    },
    client_id: {
        type: DataTypes.STRING,
        allowNull: false,
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

AllowanceOption.beforeCreate(async (allowanceOption) => {
    let isUnique = false;
    let newId;
    while (!isUnique) {
        newId = generateId();
        const existingAllowanceOption = await AllowanceOption.findOne({ where: { id: newId } });
        if (!existingAllowanceOption) {
            isUnique = true;
            allowanceOption.id = newId;
        }
    }
});

export default AllowanceOption