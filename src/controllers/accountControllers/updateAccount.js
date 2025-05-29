import Joi from "joi";
import Account from "../../models/accountModel.js";
import responseHandler from "../../utils/responseHandler.js";
import validator from "../../utils/validator.js";
import { Op } from "sequelize";

export default {
    validator: validator({
        params: Joi.object({
            id: Joi.string().required()
        }),
        body: Joi.object({
            bankHolderName: Joi.string().optional(),
            bankName: Joi.string().optional(),
            accountNumber: Joi.string().optional(),
            openingBalance: Joi.number().optional(),
            contactNumber: Joi.string().optional(),
            bankAddress: Joi.string().optional(),
        })
    }),
    handler: async (req, res) => {
        try {
            const { id } = req.params;
            const { bankHolderName, bankName, accountNumber, openingBalance, contactNumber, bankAddress } = req.body;
            const account = await Account.findByPk(id);
            if (!account) {
                    return responseHandler.error(res, "Account not found");
            }
            const existingAccount = await Account.findOne({ where: { bankHolderName, bankName, accountNumber, openingBalance, contactNumber, bankAddress, id: { [Op.ne]: id } } });
            if (existingAccount) {
                return responseHandler.error(res, "Account already exists");
            }
            await account.update({ bankHolderName, bankName, accountNumber, openingBalance, contactNumber, bankAddress, updated_by: req.user?.username });
            return responseHandler.success(res, "Account updated successfully", account);
        } catch (error) {
            return responseHandler.error(res, error?.message);
        }
    }
}

