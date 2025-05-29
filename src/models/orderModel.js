import { DataTypes } from 'sequelize';
import sequelize from '../config/db.js';
import generateId from '../middlewares/generatorId.js';

const Order = sequelize.define('Order', {
    id: {
        type: DataTypes.STRING,
        allowNull: false,
        primaryKey: true,
        unique: true,
        defaultValue: () => generateId()
    },
    related_id: {
        type: DataTypes.STRING,
        allowNull: false
    },
    orderNumber: {
        type: DataTypes.STRING,
        unique: true
    },
    client: {
        type: DataTypes.STRING,
        allowNull: false,
    },
    billing_address: {
        type: DataTypes.STRING,
        allowNull: false
    },
    shipping_address: {
        type: DataTypes.JSON,
        allowNull: false
    },
    project: {
        type: DataTypes.STRING,
        allowNull: false,
    },
    genratedBy: {
        type: DataTypes.STRING,
        allowNull: false,
    },
    status: {
        type: DataTypes.STRING,
        allowNull: false,
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
    client_Note: {
        type: DataTypes.STRING,
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

Order.beforeCreate(async (order) => {
    let isUnique = false;
    let newId;
    while (!isUnique) {
        newId = generateId();
        const existingOrder = await Order.findOne({ where: { id: newId } });
        if (!existingOrder) {
            isUnique = true;
        }
    }
    order.id = newId;

    const lastOrder = await Order.findOne({
        order: [['orderNumber', 'DESC']]
    });

    let nextNumber = 1;
    if (lastOrder && lastOrder.orderNumber) {
        const lastNumber = parseInt(lastOrder.orderNumber.replace('ORD#', ''));
        nextNumber = lastNumber + 1;
    }

    order.invoiceNumber = `ORD#${nextNumber}`;
});

export default Order;