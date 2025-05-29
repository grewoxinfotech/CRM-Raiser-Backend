import Joi from "joi";
import validator from "../../utils/validator.js";
import FormSubmission from "../../models/formSubmissionModel.js";
import responseHandler from "../../utils/responseHandler.js";

const deleteFormSubmission = {
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

            await submission.destroy();
            return responseHandler.success(res, "Form submission deleted successfully");
        } catch (error) {
            return responseHandler.error(res, error?.message);
        }
    }
};

export default deleteFormSubmission; 