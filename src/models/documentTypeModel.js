import { DataTypes } from 'sequelize';
import sequelize from '../config/db.js';
import generateId from '../middlewares/generatorId.js';

const DocumentType = sequelize.define('DocumentType', {
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
    isRequired: {
        type: DataTypes.BOOLEAN,
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

DocumentType.beforeCreate(async (documentType) => {
    let isUnique = false;
    let newId;
    while (!isUnique) {
        newId = generateId();
        const existingDocumentType = await DocumentType.findOne({
            where: { id: newId }
        });
        if (!existingDocumentType) {
            isUnique = true;
        }
    }
    documentType.id = newId;
});

export default DocumentType