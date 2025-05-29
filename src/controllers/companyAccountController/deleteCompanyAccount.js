import Joi from "joi";
import CompanyAccount from "../../models/companyAccountModel.js";
import responseHandler from "../../utils/responseHandler.js";
import validator from "../../utils/validator.js";

// Delete Company Account
export default {
    validator: validator({
        params: Joi.object({
            id: Joi.string().required()
        })
    }),
    handler: async (req, res) => {
        try {
            const { id } = req.params;
            const companyAccount = await CompanyAccount.findByPk(id);
            if (!companyAccount) {
                return responseHandler.error(res, "Company Account not found");
            }
            await companyAccount.destroy();
            return responseHandler.success(res, "Company Account deleted successfully", companyAccount);
        } catch (error) {
            return responseHandler.error(res, error?.message);
        }
    }
}