import Joi from "joi";
import validator from "../../utils/validator.js";
import OtherPayment from "../../models/otherPaymentModel.js";
import responseHandler from "../../utils/responseHandler.js";
import User from "../../models/userModel.js";

export default {
    validator: validator({
        body: Joi.object({
            employeeId: Joi.string().required(),
            title: Joi.string().required(),
            type: Joi.string().required(),
            currency: Joi.string().required(),
            amount: Joi.number().required(),
        })
    }),
    handler: async (req, res) => {
        try {
            const {employeeId, title, type, currency, amount } = req.body;
            const EMP = await User.findOne({ where: { id: req.user?.id } });
            const existingSalary = await OtherPayment.findOne({ where: { employeeId } });
            if (existingSalary) {
                return responseHandler.error(res, "Salary already exists");
            }
            const otherPayment = await OtherPayment.create({
                employeeId,
                title,
                type,
                currency,
                amount,
                client_id: req.des?.client_id,
                created_by: req.user?.username,
            });
            return responseHandler.success(res, "OtherPayment created successfully", otherPayment);
        } catch (error) {
            return responseHandler.error(res, error?.message);
        }
    }
}