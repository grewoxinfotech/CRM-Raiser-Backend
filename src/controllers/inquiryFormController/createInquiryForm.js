import Joi from "joi";
import validator from "../../utils/validator.js";
import InquiryForm from "../../models/inquiryFormModel.js";
import responseHandler from "../../utils/responseHandler.js";

export default {
    validator: validator({
        body: Joi.object({
            event_name: Joi.string().required(),
            event_location: Joi.string().required(),
            event_type: Joi.string().required(),
            start_date: Joi.date().required(),
            end_date: Joi.date().required(),
        })
    }),
    handler: async (req, res) => {
        try {
            const { event_name, event_location, event_type, start_date, end_date } = req.body;
            const inquiryForm = await InquiryForm.create({
                event_name,
                event_location,
                event_type,
                start_date,
                end_date,
                client_id: req.des?.client_id,
                created_by: req.user?.username
            });
            return responseHandler.success(res, "Inquiry form created successfully", inquiryForm);
        } catch (error) {
            return responseHandler.error(res, error?.message);
        }
    }
}
