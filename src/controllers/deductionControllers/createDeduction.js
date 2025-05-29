import Joi from "joi";
import validator from "../../utils/validator.js";
import Deduction from "../../models/deductionModel.js";
import responseHandler from "../../utils/responseHandler.js";
import User from "../../models/userModel.js";

export default {
    validator: validator({
        body: Joi.object({
            employeeId: Joi.string().required(),
            deductionOption: Joi.string().required(),
            title: Joi.string().required(),
            type: Joi.string().required(),
            currency: Joi.string().required(),
            amount: Joi.number().required(),
        })
    }),
    handler: async (req, res) => {
        try {
            const { employeeId,deductionOption, title, type, currency, amount } = req.body;
            const existingSalary = await Deduction.findOne({ where: { employeeId } });
            if (existingSalary) {
                return responseHandler.error(res, "Salary already exists");
            }
            const deduction = await Deduction.create({
                employeeId,
                deductionOption,
                title,
                type,
                currency,
                amount,
                client_id: req.des?.client_id,
                created_by: req.user?.username
            });
            return responseHandler.success(res, "Deduction created successfully", deduction);
        } catch (error) {
            return responseHandler.error(res, error?.message);
        }
    }
}