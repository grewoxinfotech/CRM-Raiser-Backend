import Joi from "joi";
import validator from "../../utils/validator.js";
import LoanOption from "../../models/LoanOptionModel.js";
import responseHandler from "../../utils/responseHandler.js";

export default {
    validator: validator({
        body: Joi.object({
            name: Joi.string().required(),
        })
    }),
    handler: async (req, res) => {
        try {
            const { name } = req.body;
            const existingLoanOption = await LoanOption.findOne({ where: { name: name } });
            if (existingLoanOption) {
                return responseHandler.error(res, "Loan option already exists");
            }
            const loanOption = await LoanOption.create({
                name,
                client_id: req.des?.client_id,
                created_by: req.user?.username,
            });
            return responseHandler.success(res, "Loan option created successfully", loanOption);
        } catch (error) {
            return responseHandler.error(res, error?.message);
        }
    }
}