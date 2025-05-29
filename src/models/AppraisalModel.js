import { DataTypes } from "sequelize";
import sequelize from "../config/db.js";
import generateId from "../middlewares/generatorId.js";

const Appraisal = sequelize.define("appraisal", {
    id: {
        type: DataTypes.STRING,
        primaryKey: true,
        unique: true,
        allowNull: false,
        defaultValue: () => generateId(),
    },
    employee: {
        type: DataTypes.STRING,
        allowNull: false,
    },
    branch: {
        type: DataTypes.STRING,
        allowNull: false,
    },
   
    businessProcess: {
        type: DataTypes.INTEGER,
        allowNull: false,
    },
    oralCommunication: {
        type: DataTypes.INTEGER,
        allowNull: false,
    },
    leadership: {
        type: DataTypes.INTEGER,
        allowNull: false,
    },
    projectManagement: {
        type: DataTypes.INTEGER,
        allowNull: false,
    },
    allocatingResources: {
        type: DataTypes.INTEGER,
        allowNull: false,
    },
    overallRating: {
        type: DataTypes.INTEGER,
        allowNull: false,
        validate: {
            max: 5,
            min: 0
        }
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

Appraisal.beforeCreate(async (appraisal) => {
    let isUnique = false;
    let newId;
    while (!isUnique) {
        newId = generateId();
        const existingAppraisal = await Appraisal.findOne({ where: { id: newId } });
        if (!existingAppraisal) {
            isUnique = true;
        }
    }
    appraisal.id = newId;
});

export default Appraisal;