import { DataTypes } from "sequelize";
import sequelize from "../config/db.js";
import generateId from "../middlewares/generatorId.js";

const BillPayment = sequelize.define('bill_payment', {
    id: {
        type: DataTypes.STRING,
        allowNull: false,
        primaryKey: true,
        unique: true,
        defaultValue: () => generateId(),
    },
    bill: {
        type: DataTypes.STRING,
        allowNull: false
    },
    account: {
        type: DataTypes.STRING,
        allowNull: false
    },
    amount: {
        type: DataTypes.FLOAT,
        allowNull: false
    },
    date: {
        type: DataTypes.DATE,
        allowNull: false
    },
    reference: {
        type: DataTypes.STRING,
        allowNull: false
    },
    description: {
        type: DataTypes.STRING,
        allowNull: false
    },
    // payment_method: {
    //     type: DataTypes.STRING,
    //     allowNull: false
    // },
    client_id: {
        type: DataTypes.STRING,
        allowNull: true,
        defaultValue: null
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

BillPayment.beforeCreate(async (billPayment) => {
    let isUnique = false;
    let newId;
    while (!isUnique) {
        newId = generateId();
        const existingBillPayment = await BillPayment.findOne({ where: { id: newId } });
        if (!existingBillPayment) {
            isUnique = true;
        }
    }
    billPayment.id = newId;
})

export default BillPayment;