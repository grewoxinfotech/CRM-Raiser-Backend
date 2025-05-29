import { DataTypes } from "sequelize";
import sequelize from "../config/db.js";
import generateId from '../middlewares/generatorId.js';

const InquiryForm = sequelize.define('inquiry_form', {
    id: {
        type: DataTypes.STRING,
        primaryKey: true,
        unique: true,
        allowNull: false,
        defaultValue: () => generateId()
    },
    event_name: {
        type: DataTypes.STRING,
        allowNull: false,
    },
    event_location: {
        type: DataTypes.STRING,
        allowNull: false,
    },
    event_type: {
        type: DataTypes.STRING,
        allowNull: false,
    },
    start_date: {
        type: DataTypes.DATE,
        allowNull: false,
    },
    end_date: {
        type: DataTypes.DATE,
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

InquiryForm.beforeCreate(async (inquiryForm) => {
    let isUnique = false;
    let newId;
    while (!isUnique) {
        newId = generateId();
        const existingInquiryForm = await InquiryForm.findOne({
            where: { id: newId }
        });
        if (!existingInquiryForm) {
            isUnique = true;
        }
    }
    inquiryForm.id = newId;
});

export default InquiryForm;
