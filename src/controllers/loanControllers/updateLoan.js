import Joi from "joi";
import validator from "../../utils/validator.js";
import Loan from "../../models/loanModel.js";
import responseHandler from "../../utils/responseHandler.js";
import { Op } from "sequelize";

export default {
    validator: validator({
        params: Joi.object({
            id: Joi.string().required()
        }),
        body: Joi.object({
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
            const { id } = req.params;
            const { loanOption, title, type, currency, amount, reason } = req.body;
            const loan = await Loan.findByPk(id);
            if (!loan) {
                return responseHandler.notFound(res, 'Loan not found');
            }

            const EMP = await User.findOne({ where: { id: req.user?.id } });
            if (!EMP) {
                return responseHandler.error(res, "Employee not found");
            }
            const existingLoan = await Loan.findOne({ where: { employeeId: EMP.employeeId, id: { [Op.not]: id } } });
            if (existingLoan) {
                return responseHandler.error(res, "Loan already exists");
            }

            await loan.update({ loanOption, title, type, currency, amount, reason, updated_by: req.user?.username });

            return responseHandler.success(res, 'Loan updated successfully', loan);
        } catch (error) {
            return responseHandler.error(res, error);
        }
    }
}