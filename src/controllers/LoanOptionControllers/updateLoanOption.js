import Joi from "joi";
import validator from "../../utils/validator.js";
import LoanOption from "../../models/LoanOptionModel.js";
import responseHandler from "../../utils/responseHandler.js";
import { Op } from "sequelize";

export default {
    validator: validator({
        params: Joi.object({
            id: Joi.string().required()
        }),
        body: Joi.object({
            name: Joi.string().required(),
        })
    }),
    handler: async (req, res) => {
        try {
            const { id } = req.params;
            const { name } = req.body;
            const loanOption = await LoanOption.findByPk(id);
            if (!loanOption) {
                return responseHandler.error(res, "Loan option not found");
            }
            const existingLoanOption = await LoanOption.findOne({ where: { name, id: { [Op.not]: id } } });
            if (existingLoanOption) {
                return responseHandler.error(res, "Loan option already exists");
            }
            await loanOption.update({
                name,
                updated_by: req.user?.username
            });
            return responseHandler.success(res, "Loan option updated successfully", loanOption);
        } catch (error) {
            return responseHandler.error(res, error?.message);
        }
    }
}
