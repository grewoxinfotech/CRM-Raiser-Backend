import Joi from "joi";
import validator from "../../utils/validator.js";
import Loan from "../../models/loanModel.js";
import responseHandler from "../../utils/responseHandler.js";
import User from "../../models/userModel.js";

export default {
    validator: validator({
        body: Joi.object({
            employeeId: Joi.string().required(),
            loanOption: Joi.string().required(),
            title: Joi.string().required(),
            type: Joi.string().required(),
            currency: Joi.string().required(),
            amount: Joi.number().required(),
            reason: Joi.string().required(),
        })
    }),
    handler: async (req, res) => {
        try {
            const {employeeId, loanOption, title, type, currency, amount, reason } = req.body;
            const existingSalary = await Loan.findOne({ where: { employeeId } });
            if (existingSalary) {
                return responseHandler.error(res, "Salary already exists");
            }
            const loan = await Loan.create({
                employeeId,
                loanOption,
                title,
                type,
                currency,
                amount,
                reason,
                client_id: req.des?.client_id,
                created_by: req.user?.username
            });
            return responseHandler.success(res, "Loan created successfully", loan);
        } catch (error) {
            return responseHandler.error(res, error?.message);
        }
    }
}