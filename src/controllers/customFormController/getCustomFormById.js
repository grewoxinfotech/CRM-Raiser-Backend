import Joi from "joi";
import validator from "../../utils/validator.js";
import CustomForm from "../../models/customFormModel.js";
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

            const customForm = await CustomForm.findOne({
                where: { id }
            });

            if (!customForm) {
                return responseHandler.notFound(res, "Custom form not found");
            }

            return responseHandler.success(res, "Custom form fetched successfully", customForm);
        } catch (error) {
            return responseHandler.error(res, error?.message);
        }
    }
}
