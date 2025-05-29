import Joi from "joi";
import validator from "../../utils/validator.js";
import InquiryForm from "../../models/inquiryFormModel.js";
import responseHandler from "../../utils/responseHandler.js";

export default {
    validator: validator({
        params: Joi.object({
            id: Joi.string().required()
        }),
        body: Joi.object({
            event_name: Joi.string().optional(),
            event_location: Joi.string().optional(),
            event_type: Joi.string().optional(),
            start_date: Joi.date().optional(),
            end_date: Joi.date().optional()
        })
    }),
    handler: async (req, res) => {
        try {
            const { id } = req.params;
            const inquiryForm = await InquiryForm.findByPk(id);

            if (!inquiryForm) {
                return responseHandler.error(res, "Inquiry form not found", 404);
            }

            await inquiryForm.update({
                ...req.body,
                updated_by: req.user?.username
            });

            return responseHandler.success(res, "Inquiry form updated successfully", inquiryForm);
        } catch (error) {
            return responseHandler.error(res, error?.message);
        }
    }
}
