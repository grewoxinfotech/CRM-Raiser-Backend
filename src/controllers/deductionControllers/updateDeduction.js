import Joi from "joi";
import validator from "../../utils/validator.js";
import Allowance from "../../models/deductionModel.js";
import responseHandler from "../../utils/responseHandler.js";
import { Op } from "sequelize";

export default {
    validator: validator({
        params: Joi.object({
            id: Joi.string().required()
        }),
        body: Joi.object({
            deductionOption: Joi.string().required(),
            title: Joi.string().required(),
            type: Joi.string().required(),
            currency: Joi.string().required(),
            amount: Joi.number().required(),
        })
    }),
    handler: async (req, res) => {
        try {
            const { id } = req.params;
            const { deductionOption, title, type, currency, amount } = req.body;
            const deduction = await Allowance.findByPk(id);
            if (!deduction) {
                return responseHandler.notFound(res, 'Allowance not found');
            }
            const EMP = await User.findOne({ where: { id: req.user?.id } });
            if (!EMP) {
                return responseHandler.error(res, "Employee not found");
            }
            const existingDeduction = await Allowance.findOne({ where: { employeeId: EMP.employeeId, id: { [Op.not]: id } } });
            if (existingDeduction) {
                return responseHandler.error(res, "Deduction already exists for this employee");
            }

            await deduction.update({ deductionOption, title, type, currency, amount, updated_by: req.user?.username });

            return responseHandler.success(res, 'Allowance updated successfully', deduction);
        } catch (error) {
            return responseHandler.error(res, error);
        }
    }
}