import Joi from "joi";
import Account from "../../models/accountModel.js";
import responseHandler from "../../utils/responseHandler.js";
import validator from "../../utils/validator.js";

export default {
    validator: validator({
        body: Joi.object({
            bankHolderName: Joi.string().required(),
            bankName: Joi.string().required(), 
            accountNumber: Joi.string().required(),
            openingBalance: Joi.number().required(),
            contactNumber: Joi.string().required(),
            bankAddress: Joi.string().required()
        })
    }),
    handler: async (req, res) => {
        try {
            const { bankHolderName, bankName, accountNumber, openingBalance, contactNumber, bankAddress } = req.body;
            
            const existingAccount = await Account.findOne({ where: { accountNumber } });
            
            if (existingAccount) {
                return res.status(400).json({
                    success: false,
                    message: "Account already exists"
                });
            }

            const account = await Account.create({ 
                bankHolderName,
                bankName,
                accountNumber, 
                openingBalance,
                contactNumber,
                bankAddress,
                client_id: req.des?.client_id,
                created_by: req.user?.username 
            });

            return res.status(201).json({
                success: true,
                message: {
                    message: "Account created successfully",
                    data: account
                }
            });

        } catch (error) {
            return responseHandler.error(res, error?.message);
        }
    }
}