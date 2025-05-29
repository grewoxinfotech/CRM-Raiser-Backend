import { DataTypes } from "sequelize";
import sequelize from "../config/db.js";
import generateId from "../middlewares/generatorId.js";

const Proposal = sequelize.define("proposal", {
    id: {
        type: DataTypes.STRING,
        allowNull: false,
        primaryKey: true,
        defaultValue: () => generateId(),
    },
    lead_title: {
        type: DataTypes.STRING,
        allowNull: false
    },
    // deal_title: {
    //     type: DataTypes.STRING,
    //     allowNull: false
    // },
    valid_till: {
        type: DataTypes.DATE,
        allowNull: false
    },
    currency: {
        type: DataTypes.STRING,
        allowNull: false
    },
    // calculatedTax: {
    //     type: DataTypes.FLOAT,
    //     allowNull: false
    // },
    description: {
        type: DataTypes.TEXT,
        allowNull: false
    },
    items: {
        type: DataTypes.JSON,
        allowNull: false
    },
    discount: {
        type: DataTypes.FLOAT,
        allowNull: false
    },
    tax: {
        type: DataTypes.FLOAT,
        allowNull: false
    },
    total: {
        type: DataTypes.FLOAT,
        allowNull: false
    },
    subtotal:{
        type: DataTypes.FLOAT,
        allowNull: false
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


Proposal.beforeCreate(async (proposal) => {
    let isUnique = false;
    let newId;
    while (!isUnique) {
        newId = generateId();
        const existingProposal = await Proposal.findOne({ where: { id: newId } });
        if (!existingProposal) {
            isUnique = true;
        }
    }
    proposal.id = newId;
});


export default Proposal;