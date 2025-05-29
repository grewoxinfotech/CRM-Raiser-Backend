import Joi from "joi";
import validator from "../../utils/validator.js";
import Inquiry from "../../models/inquiryModel.js";
import responseHandler from "../../utils/responseHandler.js";

export default {
    validator: validator({
        body: Joi.object({
            name: Joi.string().required(),
            email: Joi.string().email().required(),
            phonecode: Joi.string().optional().allow("", null),
            phone: Joi.string().required(),
            subject: Joi.string().required(),
            message: Joi.string().required()
        })
    }),
    handler: async (req, res) => {
        try {
            const { name, email, phonecode, phone, subject, message } = req.body;
            const inquiry = await Inquiry.create({ name, email, phonecode, phone, subject, message,
                client_id: req.des?.client_id,
                created_by: req.user?.username
            });
            return responseHandler.success(res, "Inquiry created successfully", inquiry);
        } catch (error) {
            return responseHandler.error(res, error?.message);
        }
    }
}