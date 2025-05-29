import { DataTypes } from "sequelize";
import sequelize from "../config/db.js";
import generateId from '../middlewares/generatorId.js';

export const Contract = sequelize.define("Contract", {
    id: {
        type: DataTypes.STRING,
        primaryKey: true,
        unique: true,
        defaultValue: () => generateId()
    },
    contract_number: {
        type: DataTypes.STRING,
        unique: true
    },
    subject: {
        type: DataTypes.STRING,
        allowNull: false,
        unique: true
    },
    client: {
        type: DataTypes.STRING,
        allowNull: false,
    },
    project: {
        type: DataTypes.STRING,
        allowNull: false,
    },
    type: {
        type: DataTypes.STRING,
        allowNull: false,
    },
    value: {
        type: DataTypes.INTEGER,
        allowNull: false,
    },
    startDate: {
        type: DataTypes.DATE,
        allowNull: false,
    },
    endDate: {
        type: DataTypes.DATE,
        allowNull: false,
    },
    description: {
        type: DataTypes.TEXT,
        allowNull: true,
    },
    currency: {
        type: DataTypes.STRING,
        allowNull: false,
    },
    phone: {
        type: DataTypes.STRING,
        allowNull: false,
    },
    city: {
        type: DataTypes.STRING,
        allowNull: false,
    },
    state: {
        type: DataTypes.STRING,
        allowNull: false,
    },
    country: {
        type: DataTypes.STRING,
        allowNull: false,
    },
    zipcode: {
        type: DataTypes.INTEGER,
        allowNull: false,
    },
    address: {
        type: DataTypes.STRING,
        allowNull: false,
    },
    notes: {
        type: DataTypes.STRING,
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

Contract.beforeCreate(async (contract) => {
    let isUnique = false;
    let newId;
    while (!isUnique) {
        newId = generateId();
        const existingContract = await Contract.findOne({ where: { id: newId } });
        if (!existingContract) {
            isUnique = true;
        }
    }
    contract.id = newId;

    const lastContract = await Contract.findOne({
        order: [['contract_number', 'DESC']]
    });

    let nextNumber = 1;
    if (lastContract && lastContract.contract_number) {
        // Extract the number from the last invoiceNumber and increment it
        const lastNumber = parseInt(lastContract.contract_number.replace('CON#', ''));
        nextNumber = lastNumber + 1;
    }

    contract.contract_number = `CON#${nextNumber}`;


});

export default Contract;
