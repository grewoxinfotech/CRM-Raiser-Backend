import { DataTypes } from "sequelize";
import sequelize from "../config/db.js";
import generateId from '../middlewares/generatorId.js';

const Customers = sequelize.define("customers", {
    id: {
        type: DataTypes.STRING,
        allowNull: false,
        primaryKey: true,
        unique: true,
        defaultValue: () => generateId(),
    },
    related_id: {
        type: DataTypes.STRING,
        allowNull: false,
    },
    customerNumber: {
        type: DataTypes.STRING,
        unique: false,
    },
    name: {
        type: DataTypes.STRING,
        allowNull: false,
    },
    contact: {
        type: DataTypes.STRING,
        allowNull: false,
    },
    phonecode: {
        type: DataTypes.STRING,
        allowNull: true,    
        defaultValue: null
    },
    email: {
        type: DataTypes.STRING,
        allowNull: true,
    },
    tax_number: {
        type: DataTypes.STRING,
        allowNull: true,
    },
    billing_address: {
        type: DataTypes.JSON,
        allowNull: true,
        defaultValue: null
    },
    shipping_address: {
        type: DataTypes.JSON,
        allowNull: true,
        defaultValue: null
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

// Customers.beforeCreate(async (customer) => {
//     let isUnique = false;
//     let newId;
//     while (!isUnique) {
//         newId = generateId();
//         const existingCustomer = await Customers.findOne({ where: { id: newId } });
//         if (!existingCustomer) {
//             isUnique = true;
//         }
//     }
//     customer.id = newId;

//     const lastCustomer = await Customers.findOne({
//         order: [['customerNumber', 'DESC']]
//     });

//     let nextNumber = 1;
//     if (lastCustomer && lastCustomer.customerNumber) {
//         const lastNumber = parseInt(lastCustomer.customerNumber.replace('CN#', ''));
//         nextNumber = lastNumber + 1;
//     }

//     customer.customerNumber = `CN#${nextNumber}`;
// });

export default Customers;