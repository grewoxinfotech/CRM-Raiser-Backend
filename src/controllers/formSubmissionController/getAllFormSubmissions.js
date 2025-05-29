import Joi from "joi";
import validator from "../../utils/validator.js";
import FormSubmission from "../../models/formSubmissionModel.js";
import responseHandler from "../../utils/responseHandler.js";

export default {
    validator: validator({
        params: Joi.object({
            formId: Joi.string().required()
        }),
        query: Joi.object({
            page: Joi.number().optional(),
            limit: Joi.number().optional()
        })
    }),
    handler: async (req, res) => {
        try {
            const { formId } = req.params;

            const submissions = await FormSubmission.findAll({
                where: {
                    form_id: formId
                },
            });

            return responseHandler.success(res, "Form submissions fetched successfully", submissions);
        } catch (error) {
            return responseHandler.error(res, error?.message);
        }
    }
};