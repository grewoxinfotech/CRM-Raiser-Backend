import { DataTypes } from "sequelize";
import sequelize from "../config/db.js";
import generateId from '../middlewares/generatorId.js';

const CompanyInquiry = sequelize.define('company_inquiry', {
    id: {
        type: DataTypes.STRING,
        primaryKey: true,
        unique: true,
        allowNull: false,
        defaultValue: () => generateId()
    },
    fullname: {
        type: DataTypes.STRING,
        allowNull: false,
    },
    business_category: {
        type: DataTypes.STRING,
        allowNull: false,
    },
    phone: {
        type: DataTypes.STRING,
        allowNull: false,
    },
    description: {
        type: DataTypes.TEXT,
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

CompanyInquiry.beforeCreate(async (companyInquiry) => {
    let isUnique = false;
    let newId;
    while (!isUnique) {
        newId = generateId();
        const existingCompanyInquiry = await CompanyInquiry.findOne({
            where: { id: newId }
        });
        if (!existingCompanyInquiry) {
            isUnique = true;
        }
    }
    companyInquiry.id = newId;
});

export default CompanyInquiry;
