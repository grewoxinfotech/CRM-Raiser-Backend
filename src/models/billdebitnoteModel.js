import { DataTypes } from 'sequelize';
import sequelize from '../config/db.js';
import generateId from '../middlewares/generatorId.js';

const BillDebitnote = sequelize.define('BillDebitnote', {
    id: {
        type: DataTypes.STRING,
        allowNull: false,
        primaryKey: true,
        unique: true,
        defaultValue: () => generateId()
    },
    bill: {
        type: DataTypes.STRING,
        allowNull: false,
    },
    date: {
        type: DataTypes.DATE,
        allowNull: false,
    },
    amount: {
        type: DataTypes.DECIMAL(10, 2),
        allowNull: false,
    },
    description: {
        type: DataTypes.STRING,
        allowNull: true,
    },
    client_id: {
        type: DataTypes.STRING,
        allowNull: true,
        defaultValue: null
    },
    created_by: {
        type: DataTypes.STRING,
        allowNull: true,
    },
    currency: {
        type: DataTypes.STRING,
        allowNull: true,
    }
}, );


BillDebitnote.beforeCreate(async (billDebitnote) => {
    let isUnique = false;
    let newId;
    while (!isUnique) {
        newId = generateId();
        const existingBillDebitnote = await BillDebitnote.findOne({ where: { id: newId } });
        if (!existingBillDebitnote) {
            isUnique = true;
        }
    }
    billDebitnote.id = newId;
})

export default BillDebitnote; 