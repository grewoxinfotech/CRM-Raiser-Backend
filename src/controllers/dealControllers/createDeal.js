import Joi from "joi";
import Deal from "../../models/dealModel.js";
import responseHandler from "../../utils/responseHandler.js";
import validator from "../../utils/validator.js";

export default {
    validator: validator({
        body: Joi.object({
            dealTitle: Joi.string().required(),
            currency: Joi.string().required(),
            value: Joi.number().required(),
            pipeline: Joi.string().required(),
            stage: Joi.string().required(),
            source: Joi.string().required(),
            category: Joi.string().allow('', null),
            closedDate: Joi.date().required(),
            company_id: Joi.string().allow('', null),
            contact_id: Joi.string().allow('', null),
        })
    }),
    handler: async (req, res) => {
        try {
            const {
                dealTitle,
                currency,
                value,
                pipeline,
                stage,
                source,
                category,
                closedDate,
                company_id,
                contact_id,
            } = req.body;

            const existingDeal = await Deal.findOne({
                where: {
                    dealTitle,
                    client_id: req.des?.client_id
                }
            });

            if (existingDeal) {
                return responseHandler.error(res, "Deal already exists");
            }

            const deal = await Deal.create({
                dealTitle,
                currency,
                value,
                pipeline,
                stage,
                source,
                category,
                closedDate,
                company_id,
                contact_id,
                client_id: req.des?.client_id,
                created_by: req.user?.username,
                deal_members: { deal_members: [] }
            });

            return responseHandler.success(res, "Deal created successfully", deal);
        } catch (error) {
            return responseHandler.error(res, error?.message);
        }
    }
};





// import Joi from "joi";
// import Deal from "../../models/dealModel.js";
// import CompanyAccount from "../../models/companyAccountModel.js";
// import Contact from "../../models/contactModel.js";
// import responseHandler from "../../utils/responseHandler.js";
// import validator from "../../utils/validator.js";

// export default {
//     validator: validator({
//         body: Joi.object({
//             dealTitle: Joi.string().required(),
//             currency: Joi.string().required(),
//             value: Joi.number().required(),
//             pipeline: Joi.string().required(),
//             stage: Joi.string().required(),
//             source: Joi.string().required(),
//             closedDate: Joi.date().required(),
//             products: Joi.object({
//                 products: Joi.array().items(Joi.string()).optional()
//             }).optional().allow("", null),
//             firstName: Joi.string().optional().allow("", null),
//             lastName: Joi.string().optional().allow("", null),
//             email: Joi.string().optional().allow("", null),
//             phone: Joi.string().optional().allow("", null),
//             company_name: Joi.string().optional().allow("", null),
//             address: Joi.string().optional().allow("", null),
//         })
//     }),
//     handler: async (req, res) => {
//         try {
//             const {
//                 dealTitle,
//                 currency,
//                 value,
//                 pipeline,
//                 stage,
//                 source,
//                 closedDate,
//                 products,
//                 firstName,
//                 lastName,
//                 email,
//                 phone,
//                 company_name,
//                 address,
//             } = req.body;

//             let companyAccount = null;
//             let contact = null;

//             // Only try to create/find company if company_name is provided
//             if (company_name) {
//                 // First check if company exists
//                 companyAccount = await CompanyAccount.findOne({
//                     where: {
//                         company_name,
//                         client_id: req.des?.client_id
//                     }
//                 });

//                 // If company doesn't exist, create new company account
//                 if (!companyAccount) {
//                     companyAccount = await CompanyAccount.create({
//                         account_owner: req.user?.id,
//                         company_name,
//                         phone_number: phone,
//                         billing_address: address,
//                         client_id: req.des?.client_id,
//                         created_by: req.user?.username
//                     });
//                 }
//             }

//             // Only try to create/find contact if firstName is provided
//             if (firstName) {
//                 // Check if contact already exists
//                 contact = await Contact.findOne({
//                     where: {
//                         first_name: firstName,
//                         company_name: companyAccount?.id || null, // Link to company if exists
//                         client_id: req.des?.client_id
//                     }
//                 });

//                 // If contact doesn't exist, create new contact
//                 if (!contact) {
//                     contact = await Contact.create({
//                         contact_owner: companyAccount?.account_owner || req.user?.id,
//                         first_name: firstName,
//                         last_name: lastName || "",
//                         company_name: companyAccount?.id || null, // Link to company if exists
//                         email,
//                         phone,
//                         address,
//                         client_id: req.des?.client_id,
//                         created_by: req.user?.username
//                     });
//                 }
//             }

//             const existingDeal = await Deal.findOne({ where: { dealTitle } });
//             if (existingDeal) {
//                 return responseHandler.error(res, "Deal already exists");
//             }

//             // Create deal with optional company and contact references
//             const deal = await Deal.create({
//                 dealTitle,
//                 currency,
//                 value,
//                 pipeline,
//                 stage,
//                 source,
//                 closedDate,
//                 products,
//                 firstName,
//                 lastName,
//                 email,
//                 phone,
//                 company_name,
//                 address,
//                 company_id: companyAccount?.id || null,
//                 contact_id: contact?.id || null,
//                 client_id: req.des?.client_id,
//                 created_by: req.user?.username
//             });

//             return responseHandler.success(res, "Deal created successfully", deal);
//         } catch (error) {
//             console.error("Error creating deal:", error);
//             return responseHandler.error(res, error?.message);
//         }
//     }
// };
