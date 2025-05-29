import Joi from "joi";
import validator from "../../utils/validator.js";
import Allowance from "../../models/allowanceModel.js";
import responseHandler from "../../utils/responseHandler.js";
import User from "../../models/userModel.js";

export default {
    validator: validator({
        body: Joi.object({
            employeeId: Joi.string().required(),
            allowanceOption: Joi.string().required(),
            title: Joi.string().required(),
            type: Joi.string().required(),
            currency: Joi.string().required(),
            amount: Joi.number().required(),
        })
    }),
    handler: async (req, res) => {
        try {
            const {employeeId, allowanceOption, title, type, currency, amount } = req.body;
            const existingSalary = await Allowance.findOne({ where: { employeeId } });
            if (existingSalary) {
                return responseHandler.error(res, "Salary already exists");
            }
            const allowance = await Allowance.create({
                employeeId,
                allowanceOption,
                title,
                type,
                currency,
                amount,
                client_id: req.des?.client_id,
                created_by: req.user?.username
            });
            return responseHandler.success(res, "Allowance created successfully", allowance);
        } catch (error) {
            return responseHandler.error(res, error?.message);
        }
    }
}