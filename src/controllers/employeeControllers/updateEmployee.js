import Joi from "joi";
import User from "../../models/userModel.js";
import validator from "../../utils/validator.js";
import responseHandler from "../../utils/responseHandler.js";
import { s3 } from "../../config/config.js";
import uploadToS3 from "../../utils/uploadToS3.js";

export default {
    validator: validator({
        params: Joi.object({
            id: Joi.string().required()
        }),
        body: Joi.object({
            firstName: Joi.string().allow('', null),
            lastName: Joi.string().allow('', null),
            address: Joi.string().allow('', null),
            phoneCode: Joi.string().optional().allow("", null),
            phone: Joi.string().allow('', null),
            gender: Joi.string().allow('', null),
            joiningDate: Joi.date().allow('', null),
            leaveDate: Joi.date().allow(null),
            currency: Joi.string().optional().allow("", null),
            branch: Joi.string().allow('', null),
            department: Joi.string().allow('', null),
            designation: Joi.string().allow('', null),
            salary: Joi.number().allow('', null),
            accountholder: Joi.string().allow('', null),
            accountnumber: Joi.number().allow('', null),
            bankname: Joi.string().allow('', null),
            ifsc: Joi.string().allow('', null),
            documents: Joi.object().optional().allow(null),
            links: Joi.object().optional().allow(null),
        })
    }),
    handler: async (req, res) => {
        try {
            const profilePic = req.files?.profilePic?.[0];
            // const e_signature = req.files?.e_signature?.[0];
            const cv = req.files?.cv?.[0];

            const { id } = req.params;
                const { firstName, lastName, address, phoneCode, phone, currency,   gender, joiningDate, leaveDate, branch, department, designation, salary, accountholder, accountnumber, bankname, ifsc, banklocation, documents, links } = req.body;

            const employee = await User.findByPk(id);
            if (!employee) {
                return responseHandler.notFound(res, "Employee not found");
            }

            const client = await User.findOne({ where: { username: employee.created_by } });

            let profilePicUrl = employee.profilePic;
            if (profilePic) {
                if (employee.profilePic) {
                    const key = decodeURIComponent(employee.profilePic.split(".com/").pop());
                    const s3Params = {
                        Bucket: s3.config.bucketName,
                        Key: key,
                    };
                    await s3.deleteObject(s3Params).promise();
                }
                profilePicUrl = await uploadToS3(profilePic, "employee", "profile-pic", employee.username, employee.created_by);
            }

            // let e_signatureUrl = employee.e_signature;
            // if (e_signature) {
            //     if (employee.e_signature) {
            //         const key = decodeURIComponent(employee.e_signature.split(".com/").pop());
            //         const s3Params = {
            //             Bucket: s3.config.bucketName,
            //             Key: key,
            //         };
            //         await s3.deleteObject(s3Params).promise();
            //     }
            //     e_signatureUrl = await uploadToS3(e_signature, "employee", "signatures", employee.username, employee.created_by);
            // }

            let cvUrl = employee.cv;
            if (cv) {
                if (employee.cv) {
                    const key = decodeURIComponent(employee.cv.split(".com/").pop());
                    const s3Params = {
                        Bucket: s3.config.bucketName,
                        Key: key,
                    };
                    await s3.deleteObject(s3Params).promise();
                }
                cvUrl = await uploadToS3(cv, "employee", "cv", employee.username, employee.created_by);
            }

            await employee.update({
                firstName,
                lastName,
                address,
                gender,
                joiningDate,
                leaveDate,
                branch,
                department,
                designation,
                salary,
                phoneCode,
                phone,
                accountholder,
                accountnumber,
                bankname,
                ifsc,
                banklocation,
                documents,
                links,
                currency,
                profilePic: profilePicUrl,
                // e_signature: e_signatureUrl,
                cv_path: cvUrl,
                updated_by: req.user?.username
            });

            return responseHandler.success(res, "Employee updated successfully", employee);
        } catch (error) {
            return responseHandler.error(res, error?.message);
        }
    }
};









// import Joi from "joi";
// import User from "../../models/userModel.js";
// import validator from "../../utils/validator.js";
// import responseHandler from "../../utils/responseHandler.js";
// import { s3 } from "../../config/config.js";
// import uploadToS3 from "../../utils/uploadToS3.js";

// export default {
//     validator: validator({
//         params: Joi.object({
//             id: Joi.string().required()
//         }),
//         body: Joi.object({
//             firstName: Joi.string().allow('', null),
//             lastName: Joi.string().allow('', null),
//             address: Joi.string().allow('', null),
//             gender: Joi.string().allow('', null),
//             joiningDate: Joi.date().allow('', null),
//             leaveDate: Joi.date().allow(null),
//             branch: Joi.string().allow('', null),
//             department: Joi.string().allow('', null),
//             designation: Joi.string().allow('', null),
//             salary: Joi.number().allow('', null),
//             accountholder: Joi.string().allow('', null),
//             accountnumber: Joi.number().allow('', null),
//             bankname: Joi.string().allow('', null),
//             ifsc: Joi.number().allow('', null),
//             documents: Joi.object().optional().allow(null),
//             links: Joi.object().optional().allow(null),
//         })
//     }),
//     handler: async (req, res) => {
//         try {
//             const profilePic = req.files?.profilePic?.[0];
//             const e_signature = req.files?.e_signature?.[0];

//             const { id } = req.params;
//             const { firstName, lastName, address, gender, joiningDate, leaveDate, branch, department, designation, salary, accountholder, accountnumber, bankname, ifsc, banklocation, documents, links } = req.body;

//             const employee = await User.findByPk(id);
//             if (!employee) {
//                 return responseHandler.notFound(res, "Employee not found");
//             }

//             const client = await User.findOne({ where: { username: employee.created_by } });

//             let profilePicUrl = employee.profilePic;
//             if (profilePic) {
//                 if (employee.profilePic) {
//                     const key = decodeURIComponent(employee.profilePic.split(".com/").pop());
//                     const s3Params = {
//                         Bucket: s3.config.bucketName,
//                         Key: key,
//                     };
//                     await s3.deleteObject(s3Params).promise();
//                 }
//                 profilePicUrl = await uploadToS3(profilePic, "employee", "profile-pic", employee.username, employee.created_by);
//             }

//             let e_signatureUrl = employee.e_signature;
//             if (e_signature) {
//                 if (employee.e_signature) {
//                     const key = decodeURIComponent(employee.e_signature.split(".com/").pop());
//                     const s3Params = {
//                         Bucket: s3.config.bucketName,
//                         Key: key,
//                     };
//                     await s3.deleteObject(s3Params).promise();
//                 }
//                 e_signatureUrl = await uploadToS3(e_signature, "employee", "signatures", employee.username, employee.created_by);
//             }

//             await employee.update({
//                 firstName,
//                 lastName,
//                 address,
//                 gender,
//                 joiningDate,
//                 leaveDate,
//                 branch,
//                 department,
//                 designation,
//                 salary,
//                 accountholder,
//                 accountnumber,
//                 bankname,
//                 ifsc,
//                 banklocation,
//                 documents,
//                 links,
//                 profilePic: profilePicUrl,
//                 e_signature: e_signatureUrl,
//                 updated_by: req.user?.username
//             });

//             return responseHandler.success(res, "Employee updated successfully", employee);
//         } catch (error) {
//             return responseHandler.error(res, error?.message);
//         }
//     }
// };