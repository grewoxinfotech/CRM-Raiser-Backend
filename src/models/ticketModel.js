import { DataTypes } from "sequelize";
import sequelize from "../config/db.js";
import generateId from "../middlewares/generatorId.js";


const Ticket = sequelize.define('ticket', {
    id: {
        type: DataTypes.STRING,
        allowNull: false,
        primaryKey: true,
        defaultValue: () => generateId()
    },
    requestor: {
        type: DataTypes.STRING,
        allowNull: false
    },
    requestorName: {
        type: DataTypes.STRING,
        allowNull: true,
        defaultValue: null
    },
    assignGroup: {
        type: DataTypes.STRING,
        allowNull: true,
        defaultValue: null
    },
    agent: {
        type: DataTypes.STRING,
        allowNull: true,
        defaultValue: null
    },
    project: {
        type: DataTypes.STRING,
        allowNull: true,
        defaultValue: null
    },
    type: {
        type: DataTypes.STRING,
        allowNull: true,
        defaultValue: null
    },
    ticketSubject: {
        type: DataTypes.STRING,
        allowNull: false
    },
    description: {
        type: DataTypes.STRING,
        allowNull: false
    },
    file: {
        type: DataTypes.STRING,
        allowNull: true,
        defaultValue: null
    },
    priority: {
        type: DataTypes.STRING,
        allowNull: true,
        defaultValue: null
    },
    channelName: {
        type: DataTypes.STRING,
        allowNull: true,
        defaultValue: null
    },
    status: {
        type: DataTypes.STRING,
        allowNull: false
    },
    tag: {
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

Ticket.beforeCreate(async (ticket) => {
    let isUnique = false;
    let newId;
    while (!isUnique) {
        newId = generateId();
        const existingTicket = await Ticket.findOne({ where: { id: newId } });
        if (!existingTicket) {
            isUnique = true;
        }
    }
    ticket.id = newId;
});

export default Ticket;