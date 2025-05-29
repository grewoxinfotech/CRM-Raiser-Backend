import { DataTypes } from 'sequelize';
import sequelize from '../config/db.js';
import generateId from '../middlewares/generatorId.js';

const AwardType = sequelize.define('AwardType', {
    id: {
        type: DataTypes.STRING,
        primaryKey: true,
        unique: true,
        allowNull: false,
        defaultValue: () => generateId()
    },
    name: {
        type: DataTypes.STRING,
        allowNull: false,
        unique: true
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

AwardType.beforeCreate(async (awardType) => {
    let isUnique = false;
    let newId;
    while (!isUnique) {
        newId = generateId();
        const existingAwardType = await AwardType.findOne({ where: { id: newId } });
        if (!existingAwardType) {
            isUnique = true;
        }
    }
    awardType.id = newId;
});

export default AwardType;