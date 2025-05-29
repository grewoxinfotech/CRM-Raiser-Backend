import Lead from "../../models/leadModel.js";
import responseHandler from "../../utils/responseHandler.js";
import Joi from "joi";
import validator from "../../utils/validator.js";
import Notification from "../../models/notificationModel.js";

export default {
    validator: validator({
        body: Joi.object({
            leadTitle: Joi.string().required(),
            leadStage: Joi.string().required(),
            pipeline: Joi.string().required(),
            currency: Joi.string().required(),
            leadValue: Joi.number().required(),
            source: Joi.string().required(),
            interest_level: Joi.string().required().valid('high', 'medium', 'low'),
            category: Joi.string().allow('', null),
            status: Joi.string().optional().allow('', null),
            inquiry_id: Joi.string().allow(null),
            company_id: Joi.string().allow(null),
            contact_id: Joi.string().allow(null),
        })
    }),

    handler: async (req, res) => {
        try {
            const {
                leadStage,
                leadTitle,
                interest_level,
                category,
                source,
                company_id,
                contact_id,
                currency,
                leadValue,
                pipeline,
                status,
                inquiry_id
            } = req.body;

            const lead = await Lead.create({
                leadStage,
                leadTitle,
                interest_level,
                category,
                source,
                company_id,
                contact_id,
                currency,
                leadValue,
                pipeline,
                status,
                inquiry_id: inquiry_id || null,
                client_id: req.des?.client_id,
                created_by: req.user?.username
            });

            // Create notification for team
            await Notification.create({
                related_id: req.user?.id,
                users: [], // For team members
                title: "New Lead Created",
                from: req.user?.id,
                client_id: req.des?.client_id,
                message: `A new lead "${leadTitle}" has been created`,
                description: `💼 Lead Overview:\n• Value: ${currency} ${leadValue}\n• Stage: ${leadStage}\n• Interest Level: ${interest_level}\n• Source: ${source}`,
                created_by: req.user?.username,
            });

            return responseHandler.success(res, "Lead created successfully!", lead);
        } catch (error) {
            return responseHandler.error(res, error?.message);
        }
    }
}
