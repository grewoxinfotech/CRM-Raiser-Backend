import { DataTypes } from 'sequelize';
import sequelize from '../config/db.js';
import generateId from '../middlewares/generatorId.js';

const TransferAccount = sequelize.define('TransferAccount', {
    id: {
        type: DataTypes.STRING,
        allowNull: false,
        primaryKey: true,
        unique: true,
        defaultValue: () => generateId()
    },
    fromAccount: {
        type: DataTypes.STRING,
        allowNull: false,
    },
    toAccount: {
        type: DataTypes.STRING,
        allowNull: false,
    },
    amount: {
        type: DataTypes.DECIMAL(10, 2),
        allowNull: false,
    },
    date: {
        type: DataTypes.DATE,
        allowNull: false,
    },
    description: {
        type: DataTypes.STRING,
        allowNull: true,
    },
    client_id: {
        type: DataTypes.STRING,
        allowNull: false
    },
    created_by: {
        type: DataTypes.STRING,
        allowNull: true,
    },
    updated_by: {
        type: DataTypes.STRING,
        allowNull: true,
    }
}, );


TransferAccount.beforeCreate(async (transferAccount) => {
    let isUnique = false;
    let newId;
    while (!isUnique) {
        newId = generateId();
        const existingTransferAccount = await TransferAccount.findOne({ where: { id: newId } });
        if (!existingTransferAccount) {
            isUnique = true;
        }
    }
    transferAccount.id = newId;
})

export default TransferAccount; 