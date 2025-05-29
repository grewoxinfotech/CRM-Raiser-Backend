import { DataTypes } from "sequelize";
import sequelize from "../config/db.js";
import generateId from '../middlewares/generatorId.js';


const Invoice = sequelize.define('invoice', {
    id: {
        type: DataTypes.STRING,
        allowNull: false,
        unique: true,
        primaryKey: true,
        defaultValue: () => generateId(),
    },
    invoiceNumber: {
        type: DataTypes.STRING,
        unique: true,
    },
    customer: {
        type: DataTypes.STRING,
        allowNull: false
    },
    subtotal: {
        type: DataTypes.INTEGER,
        allowNull: false
    },
    total_discount: {
        type: DataTypes.INTEGER,
        allowNull: true,
        defaultValue: null
    },
    related_id: {
        type: DataTypes.STRING,
        allowNull: false
    },
    issueDate: {
        type: DataTypes.DATE,
        allowNull: false
    },
    status: {
        type: DataTypes.STRING,
        allowNull: true,
        defaultValue: null
    },
    dueDate: {
        type: DataTypes.DATE,
        allowNull: false
    },
    currency: {
        type: DataTypes.STRING,
        allowNull: false
    },
    project: {
        type: DataTypes.STRING,
        allowNull: true,
        defaultValue: null
    },
    client: {
        type: DataTypes.STRING,
        allowNull: true,
        defaultValue: null
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



Invoice.beforeCreate(async (invoice) => {
    let isUnique = false;
    let newId;
    while (!isUnique) {
        newId = generateId();
        const existingInvoice = await Invoice.findOne({ where: { id: newId } });
        if (!existingInvoice) {
            isUnique = true;
        }
    }
    invoice.id = newId;

    const lastInvoice = await Invoice.findOne({
        order: [['createdAt', 'DESC']], // Sort by creation date to get the latest invoice
    });

    let nextNumber = 1;
    if (lastInvoice && lastInvoice.invoiceNumber) {
        // Extract the number part from the last invoiceNumber
        const match = lastInvoice.invoiceNumber.match(/^INV#(\d+)$/);
        if (match) {
            const lastNumber = parseInt(match[1], 10); // Extract and parse the number
            nextNumber = lastNumber + 1;
        }
    }

    // Set the new invoice number
    invoice.invoiceNumber = `INV#${nextNumber}`;
});

export default Invoice;