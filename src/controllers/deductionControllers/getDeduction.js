import Joi from "joi";
import validator from "../../utils/validator.js";
import Deduction from "../../models/deductionModel.js";
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
            const deduction = await Deduction.findByPk(id);
            if (!deduction) {
                return responseHandler.notFound(res, 'Deduction not found');
            }
            return responseHandler.success(res, 'Deduction found successfully', deduction);
        } catch (error) {
            return responseHandler.error(res, error);
        }
    }
}