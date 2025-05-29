import { DataTypes } from 'sequelize';
import sequelize from '../config/db.js';
import generateId from '../middlewares/generatorId.js';

const Message = sequelize.define('Message', {
    id: {
        type: DataTypes.STRING,
        allowNull: false,
        primaryKey: true,
        unique: true,
        defaultValue: () => generateId()
    },
    chooseMember: {
        type: DataTypes.STRING,
        allowNull: false
    },
    message: {
        type: DataTypes.STRING,
        allowNull: false
    },
    file: {
        type: DataTypes.STRING,
        allowNull: true,
        defaultValue: null
    },
    isRead: {
        type: DataTypes.BOOLEAN,
        allowNull: false,
        defaultValue: false
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

Message.beforeCreate(async (message) => {
    let isUnique = false;
    let newId;
    while (!isUnique) {
        newId = generateId();
        const existingMessage = await Message.findOne({
            where: { id: newId }
        });
        if (!existingMessage) {
            isUnique = true;
        }
    }
    message.id = newId;
});

export default Message;