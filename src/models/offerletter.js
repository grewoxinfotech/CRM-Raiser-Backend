import { DataTypes } from 'sequelize';
import sequelize from '../config/db.js';
import generateId from '../middlewares/generatorId.js';

const OfferLetter = sequelize.define('OfferLetter', {
    id: {
        type: DataTypes.STRING,
        allowNull: false,
        primaryKey: true,
        unique: true,
        defaultValue: () => generateId()
    },
    job: {
        type: DataTypes.STRING,
        allowNull: false
    },
    job_applicant: {
        type: DataTypes.STRING,
        allowNull: false
    },
    currency: {
        type: DataTypes.STRING,
        allowNull: false
    },
    offer_expiry: {
        type: DataTypes.DATE,
        allowNull: false
    },
    expected_joining_date: {
        type: DataTypes.DATE,
        allowNull: false
    },
    salary: {
        type: DataTypes.STRING,
        allowNull: false
    },
    description: {
        type: DataTypes.STRING,
        allowNull: true,
        defaultValue: null
    },
    file: {
        type: DataTypes.STRING,
        allowNull: true,
        defaultValue: null
    },
    status: {
        type: DataTypes.STRING,
        allowNull: false,
        defaultValue: "pending"
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

OfferLetter.beforeCreate(async (offerletter) => {
    let isUnique = false;
    let newId;
    while (!isUnique) {
        newId = generateId();
        const existingOfferLetter = await OfferLetter.findOne({ where: { id: newId } });
        if (!existingOfferLetter) {
            isUnique = true;
        }
    }
    offerletter.id = newId;
});

export default OfferLetter;
