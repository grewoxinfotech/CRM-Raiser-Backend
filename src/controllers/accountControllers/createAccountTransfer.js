import Joi from "joi";
import TransferAccount from "../../models/transferacconutModel.js";
import Account from "../../models/accountModel.js";
import responseHandler from "../../utils/responseHandler.js";
import validator from "../../utils/validator.js";
export default {
    validator: validator({
        body: Joi.object({
            fromAccount: Joi.string().required(),
            toAccount: Joi.string().required(),
            amount: Joi.number().required(),
            date: Joi.date().required(),
            description: Joi.string().optional().allow('', null)
        })
    }),
    handler: async (req, res) => {
        try {
            const { fromAccount, toAccount, amount, date, description } = req.body;

            if (fromAccount === toAccount) {
                return responseHandler.error(res, "Source and destination accounts cannot be the same");
            }
            
            const sourceAccount = await Account.findOne({ where: { id: fromAccount } });
            if (!sourceAccount) {
                return responseHandler.error(res, "Source account not found");
            }
            const destinationAccount = await Account.findOne({ where: { id: toAccount } });
            if (!destinationAccount) {
                return responseHandler.error(res, "Destination account not found");
            }
            // Parse opening balances as numbers
            const sourceBalance = parseFloat(sourceAccount.openingBalance);
            const destinationBalance = parseFloat(destinationAccount.openingBalance);
            if (sourceBalance < amount) {
                return responseHandler.error(res, "Insufficient balance in source account");
            }
            // Update source account balance
            await sourceAccount.update({
                openingBalance: (sourceBalance - amount).toFixed(2)
            });
            // Update destination account balance  
            await destinationAccount.update({
                openingBalance: (destinationBalance + amount).toFixed(2)
            });
            const transfer = await TransferAccount.create({
                fromAccount,
                toAccount,
                amount,
                date,
                description,
                client_id: req.des?.client_id,
                created_by: req.user?.username
            });
            return responseHandler.success(res, "Transfer completed successfully", transfer);
        } catch (error) {
            return responseHandler.error(res, error?.message);
        }
    }
}








// import Joi from "joi";
// import TransferAccount from "../../models/transferacconutModel.js";
// import Account from "../../models/accountModel.js";
// import responseHandler from "../../utils/responseHandler.js";
// import validator from "../../utils/validator.js";
// export default {
//     validator: validator({
//         body: Joi.object({
//             fromAccount: Joi.string().required(),
//             toAccount: Joi.string().required(),
//             amount: Joi.number().required(),
//             date: Joi.date().required(),
//             description: Joi.string().optional().allow('', null)
//         })
//     }),
//     handler: async (req, res) => {
//         try {
//             const { fromAccount, toAccount, amount, date, description } = req.body;
            
//             // Check if source and destination accounts are same
//             if (fromAccount === toAccount) {
//                 return responseHandler.error(res, "Source and destination accounts cannot be the same");
//             }

//             const sourceAccount = await Account.findOne({ where: { id: fromAccount } });
//             if (!sourceAccount) {
//                 return responseHandler.error(res, "Source account not found");
//             }
//             const destinationAccount = await Account.findOne({ where: { id: toAccount } });
//             if (!destinationAccount) {
//                 return responseHandler.error(res, "Destination account not found");
//             }
//             // Parse opening balances as numbers
//             const sourceBalance = parseFloat(sourceAccount.openingBalance);
//             const destinationBalance = parseFloat(destinationAccount.openingBalance);
//             if (sourceBalance < amount) {
//                 return responseHandler.error(res, "Insufficient balance in source account");
//             }
//             // Update source account balance
//             await sourceAccount.update({
//                 openingBalance: (sourceBalance - amount).toFixed(2)
//             });
//             // Update destination account balance  
//             await destinationAccount.update({
//                 openingBalance: (destinationBalance + amount).toFixed(2)
//             });
//             const transfer = await TransferAccount.create({
//                 fromAccount,
//                 toAccount,
//                 amount,
//                 date,
//                 description,
//                 client_id: req.user?.id,
//                 created_by: req.user?.username
//             });
//             return responseHandler.success(res, "Transfer completed successfully", transfer);
//         } catch (error) {
//             return responseHandler.error(res, error?.message);
//         }
//     }
// }














// import Joi from "joi";
// import TransferAccount from "../../models/transferacconutModel.js";
// import Account from "../../models/accountModel.js";
// import responseHandler from "../../utils/responseHandler.js";
// import validator from "../../utils/validator.js";
// export default {
//     validator: validator({
//         body: Joi.object({
//             fromAccount: Joi.string().required(),
//             toAccount: Joi.string().required(),
//             amount: Joi.number().required(),
//             date: Joi.date().required(),
//             description: Joi.string().optional().allow('', null)
//         })
//     }),
//     handler: async (req, res) => {
//         try {
//             const { fromAccount, toAccount, amount, date, description } = req.body;
            
//             const sourceAccount = await Account.findOne({ where: { id: fromAccount } });
//             if (!sourceAccount) {
//                 return responseHandler.error(res, "Source account not found");
//             }
//             const destinationAccount = await Account.findOne({ where: { id: toAccount } });
//             if (!destinationAccount) {
//                 return responseHandler.error(res, "Destination account not found");
//             }
//             // Parse opening balances as numbers
//             const sourceBalance = parseFloat(sourceAccount.openingBalance);
//             const destinationBalance = parseFloat(destinationAccount.openingBalance);
//             if (sourceBalance < amount) {
//                 return responseHandler.error(res, "Insufficient balance in source account");
//             }
//             // Update source account balance
//             await sourceAccount.update({
//                 openingBalance: (sourceBalance - amount).toFixed(2)
//             });
//             // Update destination account balance  
//             await destinationAccount.update({
//                 openingBalance: (destinationBalance + amount).toFixed(2)
//             });
//             const transfer = await TransferAccount.create({
//                 fromAccount,
//                 toAccount,
//                 amount,
//                 date,
//                 description,
//                 created_by: req.user?.username
//             });
//             return responseHandler.success(res, "Transfer completed successfully", transfer);
//         } catch (error) {
//             return responseHandler.error(res, error?.message);
//         }
//     }
// }








// // import Joi from "joi";
// // import TransferAccount from "../../models/transferacconutModel.js";
// // import Account from "../../models/accountModel.js";
// // import responseHandler from "../../utils/responseHandler.js";
// // import validator from "../../utils/validator.js";

// // export default {
// //     validator: validator({
// //         body: Joi.object({
// //             fromAccount: Joi.string().required(),
// //             toAccount: Joi.string().required(),
// //             amount: Joi.number().required(),
// //             date: Joi.date().required(),
// //             description: Joi.string().optional().allow('', null)
// //         })
// //     }),
// //     handler: async (req, res) => {
// //         try {
// //             const { fromAccount, toAccount, amount, date, description } = req.body;
            
// //             const sourceAccount = await Account.findOne({ where: { id: fromAccount } });
// //             if (!sourceAccount) {
// //                 return responseHandler.error(res, "Source account not found");
// //             }

// //             const destinationAccount = await Account.findOne({ where: { id: toAccount } });
// //             if (!destinationAccount) {
// //                 return responseHandler.error(res, "Destination account not found");
// //             }

// //             if (sourceAccount.openingBalance < amount) {
// //                 return responseHandler.error(res, "Insufficient balance in source account");
// //             }

// //             // Update source account balance
// //             await sourceAccount.update({
// //                 openingBalance: sourceAccount.openingBalance - amount
// //             });

// //             // Update destination account balance  
// //             await destinationAccount.update({
// //                 openingBalance: destinationAccount.openingBalance + amount
// //             });

// //             const transfer = await TransferAccount.create({
// //                 fromAccount,
// //                 toAccount,
// //                 amount,
// //                 date,
// //                 description,
// //                 created_by: req.user?.username
// //             });

// //             return responseHandler.success(res, "Transfer completed successfully", transfer);

// //         } catch (error) {
// //             return responseHandler.error(res, error?.message);
// //         }
// //     }
// // }