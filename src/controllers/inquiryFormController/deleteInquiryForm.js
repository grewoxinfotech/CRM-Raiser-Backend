import Joi from "joi";
import validator from "../../utils/validator.js";
import InquiryForm from "../../models/inquiryFormModel.js";
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
            const inquiryForm = await InquiryForm.findByPk(id);

            if (!inquiryForm) {
                return responseHandler.error(res, "Inquiry form not found", 404);
            }

            await inquiryForm.destroy();
            return responseHandler.success(res, "Inquiry form deleted successfully");
        } catch (error) {
            return responseHandler.error(res, error?.message);
        }
    }
}
