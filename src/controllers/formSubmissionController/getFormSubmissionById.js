import Joi from "joi";
import validator from "../../utils/validator.js";
import FormSubmission from "../../models/formSubmissionModel.js";
import responseHandler from "../../utils/responseHandler.js";

export default {
    validator: validator({
        params: Joi.object({
            id: Joi.string().required()
        })
    }),
    handler: async (req, res) => {
        try {
            const { id } = req.params;

            const submission = await FormSubmission.findOne({
                where: {
                    id
                }
            });

            if (!submission) {
                return responseHandler.error(res, "Form submission not found", 404);
            }

            return responseHandler.success(res, "Form submission fetched successfully", submission);
        } catch (error) {
            return responseHandler.error(res, error?.message);
        }
    }
}; 