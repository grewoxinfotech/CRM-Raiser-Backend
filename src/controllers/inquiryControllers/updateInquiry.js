import Joi from "joi";
import validator from "../../utils/validator.js";
import Inquiry from "../../models/inquiryModel.js";
import responseHandler from "../../utils/responseHandler.js";






export default {
    validator: validator({
        params: Joi.object({
            id: Joi.string().required()
        }),
        body: Joi.object({
            name: Joi.string().required(),
            email: Joi.string().email().required(),
            phonecode: Joi.string().optional().allow("", null),
            phone: Joi.string().required(),
            message: Joi.string().required()
        })
    }),
    handler: async (req, res) => {
        try {
            const { id } = req.params;
            const { name, email, phonecode, phone, message } = req.body;
            const inquiry = await Inquiry.findByPk(id);
            if (!inquiry) {
                return responseHandler.error(res, "Inquiry not found");
            }
            await inquiry.update({ name, email, phonecode, phone, message });
            return responseHandler.success(res, "Inquiry updated successfully", inquiry);
        } catch (error) {
            return responseHandler.error(res, error?.message);
        }
    }
}