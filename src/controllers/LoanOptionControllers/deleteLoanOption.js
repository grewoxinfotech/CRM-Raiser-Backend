import Joi from "joi";
import validator from "../../utils/validator.js";
import LoanOption from "../../models/LoanOptionModel.js";
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
            const loanOption = await LoanOption.findByPk(id);
            if (!loanOption) {
                return responseHandler.error(res, "Loan option not found");
            }
            await loanOption.destroy();
            return responseHandler.success(res, "Loan option deleted successfully", loanOption);
        } catch (error) {
            return responseHandler.error(res, error?.message);
        }
    }
}