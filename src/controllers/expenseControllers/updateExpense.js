import Joi from "joi";
import Expense from "../../models/expenseModel.js";
import responseHandler from "../../utils/responseHandler.js";
import validator from "../../utils/validator.js";

export default {
    validator: validator({
        params: Joi.object({
            id: Joi.string().optional()
        }),
        body: Joi.object({
            item: Joi.string().optional(),
            price: Joi.number().optional(),
            currency: Joi.string().optional(),
            purchase_date: Joi.date().optional(),
            employee: Joi.string().optional(),
            project: Joi.string().optional(),
           
            description: Joi.string().optional().allow('', null)
        })
    }),
    handler: async (req, res) => {
        try {
            const { id } = req.params;
            // const bill = req.files?.bill?.[0];

            const { item, price, currency, purchase_date, bill, employee, project, description } = req.body;
            const expense = await Expense.findByPk(id);
            if (!expense) {
                return responseHandler.error(res, "Expense not found");
            }


            await expense.update({ item, price, currency, purchase_date, employee, project, description, updated_by: req.user?.username });
            return responseHandler.success(res, "Expense updated successfully", expense);
        } catch (error) {
            return responseHandler.error(res, error?.message);
        }
    }
}