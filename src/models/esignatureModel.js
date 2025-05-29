import { DataTypes } from "sequelize";
import sequelize from "../config/db.js";
import generateId from "../middlewares/generatorId.js";
const ESignature = sequelize.define("ESignature", {
    id: {
        type: DataTypes.STRING,
        primaryKey: true,
        unique: true,
       defaultValue: () => generateId()
    },
    esignature_name: {
        type: DataTypes.STRING,
        allowNull: false,
    },
    e_signatures: {
        type: DataTypes.STRING,
        allowNull: false,
    },
    related_id: {
        type: DataTypes.STRING,
        allowNull: false,
    },
    client_id: {
        type: DataTypes.STRING,
        allowNull: false,
    },
    // user_id: {
    //     type: DataTypes.UUID,
    //     allowNull: false,
    // },
    created_by: {
        type: DataTypes.STRING,
        allowNull: true,
    },
    updated_by: {
        type: DataTypes.STRING,
        allowNull: true,
    }
} );


ESignature.beforeCreate(async (esignature) => {
    let isUnique = false;
    let newId;
    while (!isUnique) {
        newId = generateId();
        const existingESignature = await ESignature.findOne({ where: { id: newId } });
        if (!existingESignature) {
            isUnique = true;
        }
    }
    esignature.id = newId;
})
export default ESignature; 