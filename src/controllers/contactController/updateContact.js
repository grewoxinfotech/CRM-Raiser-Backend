import Joi from "joi";
import Contact from "../../models/contactModel.js";
import Notification from "../../models/notificationModel.js";
import responseHandler from "../../utils/responseHandler.js";
import validator from "../../utils/validator.js";
import { Op } from "sequelize";
import dayjs from "dayjs";

export default {
    validator: validator({
        params: Joi.object({
            id: Joi.string().required(),
        }),
        body: Joi.object({
            contact_owner: Joi.string().required(),
            first_name: Joi.string().required(),
            last_name: Joi.string().allow('', null),
            company_name: Joi.string().allow('', null),
            website: Joi.string().allow('', null),
            email: Joi.string().email().allow('', null),
            phone: Joi.string().allow('', null),
            contact_source: Joi.string().allow('', null),
            description: Joi.string().allow('', null),
            address: Joi.string().allow('', null),
            city: Joi.string().allow('', null),
            state: Joi.string().allow('', null),
            country: Joi.string().allow('', null),
            phone_code: Joi.string().allow('', null),
        })
    }),
    handler: async (req, res) => {
        try {
            const { id } = req.params;
            const { contact_owner, first_name, last_name, company_name, website, email, phone, contact_source, description, address, city, state, country, phone_code } = req.body;
            const contact = await Contact.findByPk(id);
            if (!contact) {
                return responseHandler.error(res, "Contact not found");
            }


            // Delete existing notifications for this contact
            await Notification.destroy({
                where: {
                    related_id: id,
                    section: "contact"
                },
                force: true
            });

            await contact.update({ contact_owner,
                first_name,
                last_name,
                company_name,
                website,
                email,
                phone,
                contact_source,
                description,
                address,
                city,
                state,
                country,
                phone_code,
                updated_by: req.user?.username});
            
            // Create notification for contact update
            await Notification.create({
                related_id: contact.id,
                users: [contact_owner], // Send notification to contact owner
                title: "Contact Updated",
                notification_type: "update",
                from: req.user?.id,
                client_id: req.des?.client_id,
                date: dayjs().format("YYYY-MM-DD"),
                time: dayjs().format("HH:mm:ss"),
                section: "contact",
                parent_id: req.user?.id,
                message: `Contact updated: ${first_name} ${last_name || ''}`,
                description: `📋 Contact Details:
• Name: ${first_name} ${last_name || ''}
• Company: ${company_name}
• Email: ${email}
• Phone: ${phone}
• Address: ${address ? `${address}, ${city || ''} ${state || ''} ${country || ''}` : 'Not provided'}`,
                created_by: req.user?.username,
            });

            return responseHandler.success(res, "Contact updated successfully", contact);
        } catch (error) {
            return responseHandler.error(res, error?.message);
        }
    }
}
