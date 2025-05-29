import { DataTypes } from "sequelize";
import sequelize from "../config/db.js";
import generateId from '../middlewares/generatorId.js';


const SalesQuotations = sequelize.define('sales_quotations', {
    id: {
        type: DataTypes.STRING,
        allowNull: false,
        unique: true,
        primaryKey: true,
        defaultValue: () => generateId(),
    },
    salesQuotationNumber: {
        type: DataTypes.STRING,
        unique: true,
    },
    related_id: {
        type: DataTypes.STRING,
        allowNull: false
    },
    customer: {
        type: DataTypes.STRING,
        allowNull: false
    },
    issueDate: {
        type: DataTypes.DATE,
        allowNull: false
    },
    category: {
        type: DataTypes.STRING,
        allowNull: false
    },
    items: {
        type: DataTypes.JSON,
        allowNull: false
    },
    discount: {
        type: DataTypes.INTEGER,
        allowNull: true,
        defaultValue: null
    },
    tax: {
        type: DataTypes.INTEGER,
        allowNull: true,
        defaultValue: null
    },
    total: {
        type: DataTypes.INTEGER,
        allowNull: false
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



SalesQuotations.beforeCreate(async (salesQuotations) => {
    let isUnique = false;
    let newId;
    while (!isUnique) {
        newId = generateId();
        const existingSalesQuotations = await SalesQuotations.findOne({ where: { id: newId } });
        if (!existingSalesQuotations) {
            isUnique = true;
        }
    }
    salesQuotations.id = newId;

    const lastSalesQuotation = await SalesQuotations.findOne({
        order: [['salesQuotationNumber', 'DESC']]
    });

    let nextNumber = 1;
    if (lastSalesQuotation && lastSalesQuotation.salesQuotationNumber) {
        const lastNumber = parseInt(lastSalesQuotation.salesQuotationNumber.replace('QUO#', ''));
        nextNumber = lastNumber + 1;
    }

    salesQuotations.salesQuotationNumber = `QUO#${nextNumber}`;

});

export default SalesQuotations;