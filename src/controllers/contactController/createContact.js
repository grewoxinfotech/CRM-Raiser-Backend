import Contact from "../../models/contactModel.js";
import responseHandler from "../../utils/responseHandler.js";
import Joi from "joi";
import validator from "../../utils/validator.js";
import Notification from "../../models/notificationModel.js";

export default {
    validator: validator({
        body: Joi.object({
            contact_owner: Joi.string().required(),
            first_name: Joi.string().required(),
            last_name: Joi.string().optional().allow('', null),
            company_name: Joi.string().optional().allow('', null),
            website: Joi.string().optional().allow('', null),
            email: Joi.string().optional().allow('', null),
            phone_code: Joi.string().optional().allow('', null),
            phone: Joi.string().optional().allow('', null),
            contact_source: Joi.string().optional().allow('', null),
            description: Joi.string().optional().allow('', null),
            address: Joi.string().optional().allow('', null),
            city: Joi.string().optional().allow('', null),
            state: Joi.string().optional().allow('', null),
            country: Joi.string().optional().allow('', null),
            related_id: Joi.string().optional().allow('', null),
        })
    }),

    handler: async (req, res) => {
        try {
            const {
                contact_owner, first_name, last_name, company_name,
                website, email, phone_code, phone, contact_source, description,
                address, city, state, country, related_id
            } = req.body;

            // Check if contact with same email exists
            const existingContact = await Contact.findOne({
                where: {
                    first_name: first_name,
                    company_name: company_name
                }
            });

            if (existingContact) {
                return responseHandler.conflict(res, "Contact with this name already exists!");
            }

            // Create contact
            const contact = await Contact.create({
                contact_owner,
                first_name,
                last_name,
                company_name,
                website,
                email,
                phone_code,
                phone,
                contact_source,
                description,
                address,
                city,
                state,
                country,
                related_id,
                client_id: req.des?.client_id,
                created_by: req.user?.username
            });

            // Create notification
            await Notification.create({
                related_id: contact.id,
                users: [contact_owner], // Send notification to contact owner
                title: "New Contact Added",
                from: req.user?.id,
                section: "contact",
                parent_id: req.user?.id,
                client_id: req.des?.client_id,
                message: `A new contact "${first_name} ${last_name || ''}" has been added`,
                description: `Contact Details:\n• Email: ${email}\n• Phone: ${phone}`,
                created_by: req.user?.username,
            });

            return responseHandler.success(res, "Contact created successfully!", contact);
        } catch (error) {
            return responseHandler.error(res, error?.message);
        }
    }
}; 