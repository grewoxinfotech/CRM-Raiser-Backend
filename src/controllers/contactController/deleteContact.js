import Joi from "joi";
import Contact from "../../models/contactModel.js";
import Notification from "../../models/notificationModel.js";
import responseHandler from "../../utils/responseHandler.js";
import validator from "../../utils/validator.js";


export default {
    validator: validator({
        params: Joi.object({
            id: Joi.string().required()
        })
    }),
    handler: async (req, res) => {
        try {
            const { id } = req.params;
            const contact = await Contact.findByPk(id);
            if (!contact) {
                return responseHandler.error(res, "Contact not found");
            }

            // Delete all related notifications
            await Notification.destroy({
                where: {
                    related_id: contact.id,
                    section: "contact"
                }
            });

            // Delete the contact
            await contact.destroy();
            
            return responseHandler.success(res, "Contact deleted successfully", contact);
        } catch (error) {
            return responseHandler.error(res, error?.message);
        }
    }
}