import { DataTypes } from "sequelize";
import sequelize from "../config/db.js";
import generateId from '../middlewares/generatorId.js';

const CustomForm = sequelize.define('custom_form', {
    id: {
        type: DataTypes.STRING,
        primaryKey: true,
        unique: true,
        allowNull: false,
        defaultValue: () => generateId()
    },
    title: {
        type: DataTypes.STRING,
        allowNull: false,
    },
    description: {
        type: DataTypes.TEXT,
        allowNull: false,
    },
    event_name: {
        type: DataTypes.STRING,
        allowNull: false,
    },
    event_location: {
        type: DataTypes.STRING,
        allowNull: false,
    },
    start_date: {
        type: DataTypes.DATE,
        allowNull: false,
    },
    end_date: {
        type: DataTypes.DATE,
        allowNull: false,
    },
    fields: {
        type: DataTypes.JSON,
        allowNull: false,
        validate: {
            isValidFieldsFormat(value) {
                if (typeof value === 'string') {
                    value = JSON.parse(value);
                }

                const allowedTypes = [
                    'text',           // Short text
                    'textarea',       // Long text
                    'number',         // Numbers
                    'phone',          // Phone numbers
                    'email',          // Email addresses
                    'url',            // URLs/websites
                    'date',           // Date picker
                    'time',           // Time picker
                    'datetime',       // Date and time picker
                    'boolean',        // Yes/No
                    'select',         // Single select dropdown
                    'multiselect',    // Multi select
                    'radio',          // Radio buttons
                    'checkbox',       // Checkboxes
                    'password'        // Password field
                ];

                Object.values(value).forEach(field => {
                    if (!field.type || !allowedTypes.includes(field.type)) {
                        throw new Error(`Invalid field type. Allowed types are: ${allowedTypes.join(', ')}`);
                    }

                    // Validate field configuration
                    if (field.validation) {
                        const validationRules = field.validation;

                        // Validate min/max length for text fields
                        if (['text', 'textarea', 'password'].includes(field.type)) {
                            if (validationRules.minLength && !Number.isInteger(validationRules.minLength)) {
                                throw new Error('minLength must be an integer');
                            }
                            if (validationRules.maxLength && !Number.isInteger(validationRules.maxLength)) {
                                throw new Error('maxLength must be an integer');
                            }
                        }

                        // Validate min/max for number fields
                        if (field.type === 'number') {
                            if (validationRules.min && typeof validationRules.min !== 'number') {
                                throw new Error('min must be a number');
                            }
                            if (validationRules.max && typeof validationRules.max !== 'number') {
                                throw new Error('max must be a number');
                            }
                        }

                        // Validate options for select/radio/checkbox
                        if (['select', 'multiselect', 'radio', 'checkbox'].includes(field.type)) {
                            if (!Array.isArray(field.options)) {
                                throw new Error('Options must be an array for select/radio/checkbox fields');
                            }
                        }
                    }
                });
            }
        }
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

CustomForm.beforeCreate(async (customForm) => {
    let isUnique = false;
    let newId;
    while (!isUnique) {
        newId = generateId();
        const existingCustomForm = await CustomForm.findOne({
            where: { id: newId }
        });
        if (!existingCustomForm) {
            isUnique = true;
        }
    }
    customForm.id = newId;
});

export default CustomForm;
