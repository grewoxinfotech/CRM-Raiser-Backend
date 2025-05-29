import { DataTypes } from "sequelize";
import sequelize from "../config/db.js";
import generateId from "../middlewares/generatorId.js";

const Payment = sequelize.define('Payment', {
    id: {
        type: DataTypes.STRING,
        primaryKey: true,
        unique: true,
        defaultValue: () => generateId()
    },
    related_id: {
        type: DataTypes.STRING,
        allowNull: false,
    },
    project_name: {
        type: DataTypes.STRING,
        allowNull: true,
        defaultValue: null,
    },
    invoice: {
        type: DataTypes.STRING,
        allowNull: true,
        defaultValue: null,
    },
    expense: {
        type: DataTypes.STRING,
        allowNull: true,
        defaultValue: null,
    },
    estimate: {
        type: DataTypes.STRING,
        allowNull: true,
        defaultValue: null,
    },
    paidOn: {
        type: DataTypes.DATE,
        allowNull: false,
    },
    amount: {
        type: DataTypes.STRING,
        allowNull: false,
    },
    currency: {
        type: DataTypes.STRING,
        allowNull: false,
    },
    status: {
        type: DataTypes.STRING,
        allowNull: false,
        defaultValue: 'pending',
    },
    transactionId: {
        type: DataTypes.STRING,
        allowNull: true,
        defaultValue: null,
    },
    paymentMethod: {
        type: DataTypes.STRING,
        allowNull: false,
    },
    receipt: {
        type: DataTypes.STRING,
        allowNull: true,
        defaultValue: null,
    },
    remark: {
        type: DataTypes.STRING,

        allowNull: true,
    },
    client_id: {
        type: DataTypes.STRING,
        allowNull: false
    },
    created_by: {
        type: DataTypes.STRING,
        defaultValue: null,
        allowNull: true,
    },
    updated_by: {
        type: DataTypes.STRING,
        defaultValue: null,
        allowNull: true,

    }
});

export default Payment;
