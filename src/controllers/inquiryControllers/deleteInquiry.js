import Joi from "joi";
import validator from "../../utils/validator.js";
import Inquiry from "../../models/inquiryModel.js";
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
            const inquiry = await Inquiry.findByPk(id);
            if (!inquiry) {
                return responseHandler.error(res, "Inquiry not found");
            }
            await inquiry.destroy();
            return responseHandler.success(res, "Inquiry deleted successfully", inquiry);
        } catch (error) {
            return responseHandler.error(res, error?.message);
        }
    }
}