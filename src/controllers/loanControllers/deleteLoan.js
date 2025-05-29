import Joi from "joi";
import validator from "../../utils/validator.js";
import Loan from "../../models/loanModel.js";
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
            const loan = await Loan.findByPk(id);
            if (!loan) {
                return responseHandler.notFound(res, 'Loan not found');
            }
            await loan.destroy();
            return responseHandler.success(res, 'Loan deleted successfully', loan);
        } catch (error) {
            return responseHandler.error(res, error);
        }
    }
}