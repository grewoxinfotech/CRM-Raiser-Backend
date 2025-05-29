import { DataTypes } from "sequelize";
import sequelize from "../config/db.js";
import generateId from "../middlewares/generatorId.js";

const DeductionOption = sequelize.define("DeductionOption", {
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

DeductionOption.beforeCreate(async (deductionOption) => {
    let isUnique = false;
    let newId;
    while (!isUnique) {
        newId = generateId();
        const existingDeductionOption = await DeductionOption.findOne({ where: { id: newId } });
        if (!existingDeductionOption) {
            isUnique = true;
            deductionOption.id = newId;
        }
    }
});

export default DeductionOption