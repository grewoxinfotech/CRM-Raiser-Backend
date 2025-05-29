import Joi from "joi";
import EmailSettings from "../../models/emailSettingModel.js";
import validator from "../../utils/validator.js";
import responseHandler from "../../utils/responseHandler.js";
import nodemailer from 'nodemailer';
import { Op } from 'sequelize';

export default {
    // Create email settings
    createSettings: {
        validator: validator({
            body: Joi.object({
                email: Joi.string().email().required(),
                app_password: Joi.string().required(),
                is_default: Joi.boolean().default(false),
                is_active: Joi.boolean().default(true)
            })
        }),
        handler: async (req, res) => {
            try {
                const { email, app_password, is_default, is_active } = req.body;

                // Check if settings already exist for this client
                const existingSettings = await EmailSettings.findOne({
                    where: { 
                        client_id: req.des?.client_id,
                        email: email
                    }
                });

                if (existingSettings) {
                    return responseHandler.error(res, "Email settings already exist for this email");
                }

                // Test email connection before saving
                try {
                    const transporter = nodemailer.createTransport({
                        service: 'gmail',
                        auth: {
                            user: email,
                            pass: app_password
                        }
                    });

                    // Verify connection
                    await transporter.verify();

                } catch (error) {
                    console.error('Email verification failed:', error);
                    return responseHandler.error(res, "Invalid email credentials. Please check your email and app password");
                }

                // If this is the first settings, make it default
                const settingsCount = await EmailSettings.count({
                    where: { client_id: req.des?.client_id }
                });

                const settings = await EmailSettings.create({
                    email,
                    app_password,
                    is_default: settingsCount === 0 ? true : is_default,
                    is_active,
                    client_id: req.des?.client_id,
                    created_by: req.user?.username
                });

                return responseHandler.success(res, "Email settings created successfully", {
                    ...settings.toJSON(),
                    app_password: undefined
                });
            } catch (error) {
                console.error('Create settings error:', error);
                return responseHandler.error(res, error?.message || "Failed to create email settings");
            }
        }
    },

    // Get email settings
    getSettings: {
        handler: async (req, res) => {
            try {
                const settings = await EmailSettings.findAll({
                    where: { client_id: req.des?.client_id },
                    attributes: { exclude: ['app_password'] },
                    order: [['createdAt', 'DESC']]
                });

                return responseHandler.success(res, "Email settings retrieved successfully", settings);
            } catch (error) {
                return responseHandler.error(res, error?.message || "Failed to retrieve email settings");
            }
        }
    },

    // Update email settings
    updateSettings: {
        validator: validator({
            params: Joi.object({
                id: Joi.string().required()
            }),
            body: Joi.object({
                email: Joi.string().email(),
                app_password: Joi.string(),
                is_default: Joi.boolean(),
                is_active: Joi.boolean()
            })
        }),
        handler: async (req, res) => {
            try {
                const { id } = req.params;
                const updates = req.body;

                const settings = await EmailSettings.findOne({
                    where: { 
                        id,
                        client_id: req.des?.client_id
                    }
                });

                if (!settings) {
                    return responseHandler.error(res, "Email settings not found");
                }

                // If updating credentials, test them first
                if (updates.email || updates.app_password) {
                    try {
                        const transporter = nodemailer.createTransport({
                            service: 'gmail',
                            auth: {
                                user: updates.email || settings.email,
                                pass: updates.app_password || settings.app_password
                            }
                        });

                        await transporter.verify();
                    } catch (error) {
                        return responseHandler.error(res, "Invalid email credentials");
                    }
                }

                await settings.update({
                    ...updates,
                    updated_by: req.user?.username
                });

                return responseHandler.success(res, "Email settings updated successfully", {
                    ...settings.toJSON(),
                    app_password: undefined
                });
            } catch (error) {
                return responseHandler.error(res, error?.message || "Failed to update email settings");
            }
        }
    },

    // Delete email settings
    deleteSettings: {
        validator: validator({
            params: Joi.object({
                id: Joi.string().required()
            })
        }),
        handler: async (req, res) => {
            try {
                const { id } = req.params;

                const settings = await EmailSettings.findOne({
                    where: { 
                        id,
                        client_id: req.des?.client_id
                    }
                });

                if (!settings) {
                    return responseHandler.error(res, "Email settings not found");
                }

                // Don't allow deleting the only default settings
                if (settings.is_default) {
                    const otherSettings = await EmailSettings.findOne({
                        where: {
                            client_id: req.des?.client_id,
                            id: { [Op.ne]: id },
                            is_active: true
                        }
                    });

                    if (!otherSettings) {
                        return responseHandler.error(res, "Cannot delete the only active email settings");
                    }

                    // Make another setting default
                    await otherSettings.update({ is_default: true });
                }

                await settings.destroy();

                return responseHandler.success(res, "Email settings deleted successfully");
            } catch (error) {
                return responseHandler.error(res, error?.message || "Failed to delete email settings");
            }
        }
    }
};