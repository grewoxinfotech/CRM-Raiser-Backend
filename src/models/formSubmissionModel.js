import { DataTypes } from "sequelize";
import sequelize from "../config/db.js";
import generateId from '../middlewares/generatorId.js';

const FormSubmission = sequelize.define('form_submission', {
    id: {
        type: DataTypes.STRING,
        primaryKey: true,
        unique: true,
        allowNull: false,
        defaultValue: () => generateId()
    },
    form_id: {
        type: DataTypes.STRING,
        allowNull: false,
        references: {
            model: 'custom_forms',
            key: 'id'
        }
    },
    submission_data: {
        type: DataTypes.JSON,
        allowNull: false,
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

FormSubmission.beforeCreate(async (submission) => {
    let isUnique = false;
    let newId;
    while (!isUnique) {
        newId = generateId();
        const existingSubmission = await FormSubmission.findOne({
            where: { id: newId }
        });
        if (!existingSubmission) {
            isUnique = true;
        }
    }
    submission.id = newId;
});

export default FormSubmission; 