import { DataTypes } from "sequelize";
import sequelize from "../config/db.js";
import generateId from '../middlewares/generatorId.js';

const CompanyAccount = sequelize.define("company_accounts", {
    id: {
        type: DataTypes.STRING,
        allowNull: false,
        primaryKey: true,
        unique: true,
        defaultValue: () => generateId(),
    },
    account_owner: {
        type: DataTypes.STRING,
        allowNull: false,
    },
    company_name: {
        type: DataTypes.STRING,
        allowNull: false,
    },
    company_source: {
        type: DataTypes.STRING,
        allowNull: true,
    },
    email: {
        type: DataTypes.STRING,
        allowNull: true,
    },
    company_number: {
        type: DataTypes.STRING,
        allowNull: true,
    },
    company_type: {
        type: DataTypes.STRING,
        allowNull: true,
    },
    company_category: {
        type: DataTypes.STRING,
        allowNull: true,
    },
    company_revenue: {
        type: DataTypes.STRING,
        allowNull: true,
    },
    phone_code: {
        type: DataTypes.STRING,
        allowNull: true,
    },
    phone_number: {
        type: DataTypes.STRING,
        allowNull: true,
    },
    website: {
        type: DataTypes.STRING,
        allowNull: true,
    },
    billing_address: {
        type: DataTypes.STRING,
        allowNull: true,
    },
    billing_city: {
        type: DataTypes.STRING,
        allowNull: true,
    },
    billing_state: {
        type: DataTypes.STRING,
        allowNull: true,
    },
    billing_pincode: {
        type: DataTypes.STRING,
        allowNull: true,
    },
    billing_country: {
        type: DataTypes.STRING,
        allowNull: true,
    },
    shipping_address: {
        type: DataTypes.STRING,
        allowNull: true,
    },
    shipping_city: {
        type: DataTypes.STRING,
        allowNull: true,
    },
    shipping_state: {
        type: DataTypes.STRING,
        allowNull: true,
    },
    shipping_pincode: {
        type: DataTypes.STRING,
        allowNull: true,
    },
    shipping_country: {
        type: DataTypes.STRING,
        allowNull: true,
    },
    description: {
        type: DataTypes.TEXT,
        allowNull: true,
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

// Generate unique ID before creating
CompanyAccount.beforeCreate(async (companyAccount) => {
    let isUnique = false;
    let newId;
    while (!isUnique) {
        newId = generateId();
        const existingAccount = await CompanyAccount.findOne({ where: { id: newId } });
        if (!existingAccount) {
            isUnique = true;
        }
    }
    companyAccount.id = newId;
});

export default CompanyAccount; 