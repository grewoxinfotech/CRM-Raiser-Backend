import Joi from "joi";
import validator from "../../utils/validator.js";
import OtherPayment from "../../models/otherPaymentModel.js";
import responseHandler from "../../utils/responseHandler.js";
import { Op } from "sequelize";

export default {
    validator: validator({
        params: Joi.object({
            id: Joi.string().required()
        }),
        body: Joi.object({
            title: Joi.string().required(),
            type: Joi.string().required(),
            currency: Joi.string().required(),
            amount: Joi.number().required(),
        })
    }),
    handler: async (req, res) => {
        try {
            const { id } = req.params;
            const { title, type, currency, amount } = req.body;
            const otherPayment = await OtherPayment.findByPk(id);
            if (!otherPayment) {
                return responseHandler.notFound(res, 'OtherPayment not found');
            }
            const existingOtherPayment = await OtherPayment.findOne({ where: { employeeId: otherPayment.employeeId, title, type, currency, amount, id: { [Op.not]: otherPayment.id } } });
            if (existingOtherPayment) {
                return responseHandler.error(res, "OtherPayment already exists");
            }
            await otherPayment.update({ title, type, currency, amount, updated_by: req.user?.username });

            return responseHandler.success(res, 'OtherPayment updated successfully', otherPayment);
        } catch (error) {
            return responseHandler.error(res, error);
        }
    }
}