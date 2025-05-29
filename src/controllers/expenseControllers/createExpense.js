import Joi from "joi";
import Expense from "../../models/expenseModel.js";
import responseHandler from "../../utils/responseHandler.js";
import validator from "../../utils/validator.js";
import uploadToS3 from "../../utils/uploadToS3.js";


export default {
    validator: validator({
        params: Joi.object({
            id: Joi.string().required()
        }),
        body: Joi.object({
            item: Joi.string().required(),
            price: Joi.number().required(),
            currency: Joi.string().required(),
            purchase_date: Joi.date().required(),
            // employee: Joi.string().required(),
            project: Joi.string().required(),
            // bill: Joi.string().optional().allow('', null),
            description: Joi.string().optional().allow('', null)
        })
    }),
    handler: async (req, res) => {
        try {
            const { id } = req.params;
            const bill = req.files?.bill?.[0];

            const { item, price, currency, purchase_date, project, description } = req.body;

            const receiptUrl = await uploadToS3(bill, "client", "expenses", req.user?.username);

            const expense = await Expense.create({
                related_id: id, item, price, currency, purchase_date, project, bill: receiptUrl, description,
                client_id: req.des?.client_id, created_by: req.user?.username
            });
            return responseHandler.success(res, "Expense created successfully", expense);
        } catch (error) {
            return responseHandler.error(res, error?.message);
        }
    }
}