import Joi from "joi";
import validator from "../../utils/validator.js";
import DeductionOption from "../../models/DeductionOptionModel.js";
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
            const deductionOption = await DeductionOption.findByPk(id);
            if (!deductionOption) {
                return responseHandler.error(res, "deducation option not found");
            }
            return responseHandler.success(res, "deducation option fetched successfully", deductionOption);
        } catch (error) {
            return responseHandler.error(res, error?.message);
        }
    }
}