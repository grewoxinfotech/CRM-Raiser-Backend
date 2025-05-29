import Joi from "joi";
import Expense from "../../models/expenseModel.js";
import responseHandler from "../../utils/responseHandler.js";
import validator from "../../utils/validator.js";

export default {
    validator: validator({
        params: Joi.object({
            id: Joi.string().required()
        })
    }),
    handler: async (req, res) => {
        try {
            const { id } = req.params;
            const expense = await Expense.findByPk(id);
            if (!expense) {
                return responseHandler.error(res, "Expense not found");
            }
            await expense.destroy();
            return responseHandler.success(res, "Expense deleted successfully", expense);
        } catch (error) {
            return responseHandler.error(res, error?.message);
        }
    }
}
