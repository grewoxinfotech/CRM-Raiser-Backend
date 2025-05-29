import Joi from "joi";
import validator from "../../utils/validator.js";
import FormSubmission from "../../models/formSubmissionModel.js";
import CustomForm from "../../models/customFormModel.js";
import responseHandler from "../../utils/responseHandler.js";

const validateField = (value, field) => {
    const { type, validation = {} } = field;

    // Text, Textarea, Password validation
    if (['text', 'textarea', 'password'].includes(type)) {
        if (validation.minLength && value.length < validation.minLength) {
            throw new Error(`Field must be at least ${validation.minLength} characters long`);
        }
        if (validation.maxLength && value.length > validation.maxLength) {
            throw new Error(`Field cannot exceed ${validation.maxLength} characters`);
        }
    }

    // Number validation
    if (type === 'number') {
        const numValue = Number(value);
        if (isNaN(numValue)) {
            throw new Error('Value must be a number');
        }
        if (validation.min !== undefined && numValue < validation.min) {
            throw new Error(`Value must be greater than or equal to ${validation.min}`);
        }
        if (validation.max !== undefined && numValue > validation.max) {
            throw new Error(`Value must be less than or equal to ${validation.max}`);
        }
    }

    // Phone validation
    if (type === 'phone') {
        const phoneRegex = /^\+?[\d\s-]+$/;
        if (!phoneRegex.test(value)) {
            throw new Error('Invalid phone number format');
        }
        if (validation.minLength && value.length < validation.minLength) {
            throw new Error(`Phone number must be at least ${validation.minLength} characters`);
        }
    }

    // Email validation
    if (type === 'email') {
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        if (!emailRegex.test(value)) {
            throw new Error('Invalid email format');
        }
    }

    // URL validation
    if (type === 'url') {
        try {
            new URL(value);
        } catch {
            throw new Error('Invalid URL format');
        }
    }

    // Date validation
    if (type === 'date') {
        const date = new Date(value);
        if (isNaN(date.getTime())) {
            throw new Error('Invalid date format');
        }
        if (validation.minDate && date < new Date(validation.minDate)) {
            throw new Error(`Date must be after ${validation.minDate}`);
        }
        if (validation.maxDate && date > new Date(validation.maxDate)) {
            throw new Error(`Date must be before ${validation.maxDate}`);
        }
    }

    // Select/Radio validation
    if (['select', 'radio'].includes(type)) {
        if (!field.options.includes(value)) {
            throw new Error('Invalid option selected');
        }
    }

    // Multiselect/Checkbox validation
    if (['multiselect', 'checkbox'].includes(type)) {
        if (type === 'multiselect') {
            if (!Array.isArray(value)) {
                throw new Error('Value must be an array');
            }
            if (!value.every(v => field.options.includes(v))) {
                throw new Error('Invalid options selected');
            }
            if (validation.minSelect && value.length < validation.minSelect) {
                throw new Error(`Please select at least ${validation.minSelect} options`);
            }
            if (validation.maxSelect && value.length > validation.maxSelect) {
                throw new Error(`Please select no more than ${validation.maxSelect} options`);
            }
        } else if (type === 'checkbox') {
            // For checkbox fields, expect an object with boolean values
            if (typeof value !== 'object' || value === null) {
                throw new Error('Value must be an object with boolean values');
            }

            // Validate that all options are present with boolean values
            field.options.forEach(option => {
                if (typeof value[option] !== 'boolean') {
                    throw new Error(`Invalid value for option '${option}'. Must be a boolean.`);
                }
            });

            // Check if any extra options are present
            Object.keys(value).forEach(option => {
                if (!field.options.includes(option)) {
                    throw new Error(`Invalid option '${option}'`);
                }
            });

            // Convert boolean object to array for storage
            const selectedOptions = Object.entries(value)
                .filter(([_, isSelected]) => isSelected)
                .map(([option]) => option);

            // Apply min/max select validations on the converted array
            if (validation.minSelect && selectedOptions.length < validation.minSelect) {
                throw new Error(`Please select at least ${validation.minSelect} options`);
            }
            if (validation.maxSelect && selectedOptions.length > validation.maxSelect) {
                throw new Error(`Please select no more than ${validation.maxSelect} options`);
            }

            // Replace the value with the array format for storage
            return selectedOptions;
        }
    }
};

export default {
    validator: validator({
        params: Joi.object({
            formId: Joi.string().required()
        }),
        body: Joi.object({
            submission_data: Joi.object().required()
        })
    }),
    handler: async (req, res) => {
        try {
            const { formId } = req.params;
            const { submission_data } = req.body;

            // Check if form exists and is still active
            const form = await CustomForm.findOne({
                where: { id: formId }
            });

            if (!form) {
                return responseHandler.notFound(res, "Form not found");
            }

            // Check if form has expired
            const currentDate = new Date();
            const endDate = new Date(form.end_date);

            if (currentDate > endDate) {
                return responseHandler.badRequest(res, "Form has expired");
            }

            // Parse form fields
            const formFields = typeof form.fields === 'string'
                ? JSON.parse(form.fields)
                : form.fields;

            // Create a copy of submission data to modify
            const processedSubmissionData = { ...submission_data };

            // Validate each field
            for (const [fieldName, fieldConfig] of Object.entries(formFields)) {
                const value = processedSubmissionData[fieldName];

                // Check required fields
                if (fieldConfig.required && (value === undefined || value === null || value === '')) {
                    return responseHandler.badRequest(res, `Field '${fieldName}' is required`);
                }

                // Skip validation for empty optional fields
                if (!fieldConfig.required && (value === undefined || value === null || value === '')) {
                    continue;
                }

                try {
                    // For checkbox fields, validateField will return the processed array
                    const processedValue = validateField(value, fieldConfig);
                    if (fieldConfig.type === 'checkbox' && processedValue !== undefined) {
                        processedSubmissionData[fieldName] = processedValue;
                    }
                } catch (error) {
                    return responseHandler.badRequest(res, `${fieldName}: ${error.message}`);
                }
            }

            // Create form submission with processed data
            const submission = await FormSubmission.create({
                form_id: formId,
                submission_data: processedSubmissionData,
                client_id: form.client_id,
                created_by: req.user?.username || 'Public User'
            });

            return responseHandler.created(res, "Form submitted successfully", submission);
        } catch (error) {
            console.error('Form submission error:', error);
            return responseHandler.internalServerError(res, error);
        }
    }
};
