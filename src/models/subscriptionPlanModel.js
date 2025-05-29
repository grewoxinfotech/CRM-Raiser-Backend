import { DataTypes } from 'sequelize';
import sequelize from '../config/db.js';
import generateId from '../middlewares/generatorId.js';

const SubscriptionPlan = sequelize.define('SubscriptionPlan', {
    id: {
        type: DataTypes.STRING,
        primaryKey: true,
        unique: true,
        defaultValue: () => generateId()
    },
    name: {
        type: DataTypes.STRING,
        allowNull: false,
        unique: true
    },
    currency: {
        type: DataTypes.STRING,
        allowNull: false
    },
    price: {
        type: DataTypes.DECIMAL(10, 2),
        allowNull: false
    },
    duration: {
        type: DataTypes.STRING,
        allowNull: false
    },
    trial_period: {
        type: DataTypes.STRING,
        allowNull: true,
        defaultValue: null
    },
    max_users: {
        type: DataTypes.STRING,
        allowNull: false
    },
    max_clients: {
        type: DataTypes.STRING,
        allowNull: false
    },
    max_customers: {
        type: DataTypes.STRING,
        allowNull: false
    },
    max_vendors: {
        type: DataTypes.STRING,
        allowNull: false
    },
    is_default: {
        type: DataTypes.BOOLEAN,
        allowNull: false,
        defaultValue: false
    },
    storage_limit: {
        type: DataTypes.STRING,
        allowNull: false
    },
    features: {
        type: DataTypes.JSON,
        allowNull: true,
        defaultValue: null
    },
    status: {
        type: DataTypes.ENUM('active', 'inactive'),
        allowNull: false,
        defaultValue: 'active'
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

SubscriptionPlan.beforeCreate(async (subscriptionPlan) => {
    let isUnique = false;
    let newId;
    while (!isUnique) {
        newId = generateId();
        const existingSubscriptionPlan = await SubscriptionPlan.findOne({ where: { id: newId } });
        if (!existingSubscriptionPlan) {
            isUnique = true;
        }
    }
    subscriptionPlan.id = newId;
});

export default SubscriptionPlan; 