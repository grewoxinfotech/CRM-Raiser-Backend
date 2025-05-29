import Joi from "joi";
import responseHandler from "../../utils/responseHandler.js";
import validator from "../../utils/validator.js";
import User from "../../models/userModel.js";
import { s3 } from "../../config/config.js";
import uploadToS3 from "../../utils/uploadToS3.js";
import { Op } from "sequelize";

export default {
    validator: validator({
        params: Joi.object({
            id: Joi.string().required()
        }),
        body: Joi.object({
            firstName: Joi.string().optional().allow('', null),
            lastName: Joi.string().optional().allow('', null),
            phoneCode: Joi.string().optional().allow('', null),
            phone: Joi.string().optional().allow('', null),
            bankname: Joi.string().optional().allow('', null),
            ifsc: Joi.string().optional().allow('', null),
            banklocation: Joi.string().optional().allow('', null),
            accountholder: Joi.string().optional().allow('', null),
            accountnumber: Joi.number().optional().allow('', null),
            gstIn: Joi.string().optional().allow('', null),
            city: Joi.string().optional().allow('', null),
            state: Joi.string().optional().allow('', null),
            website: Joi.string().optional().allow('', null),
            accounttype: Joi.string().optional().allow('', null),
            country: Joi.string().optional().allow('', null),
            zipcode: Joi.string().optional().allow('', null),
            address: Joi.string().optional().allow('', null),
            storage_limit: Joi.number().optional().allow('', null),
            storage_used: Joi.number().optional().allow('', null)
        })
    }),
    handler: async (req, res) => {
        try {
            const profilePic = req.files?.profilePic?.[0] || null;



            const { id } = req.params;
            const { firstName, lastName, phoneCode,
                phone, bankname, ifsc, banklocation, website, accountholder, accountnumber, gstIn,
                city, state, country, zipcode, address, accounttype, storage_limit, storage_used } = req.body;

            const client = await User.findByPk(id);
            if (!client) {
                return responseHandler.notFound(res, "Client not found");
            }


            const existingPhone = await User.findOne({ where: { phone, id: { [Op.not]: client.id } } });
            if (existingPhone) {
                return responseHandler.error(res, "Phone number already exists");
            }

            // let profilePicUrl = client.profilePic;
            let profilePicUrl = client.profilePic;
            if (profilePic) {
                if (client.profilePic) {
                    const key = decodeURIComponent(client.profilePic.split(".com/").pop());
                    const s3Params = {
                        Bucket: s3.config.bucketName,
                        Key: key,
                    };
                    try {
                        await s3.deleteObject(s3Params).promise();
                    } catch (error) {
                        console.error('Error deleting old profile pic:', error);
                    }
                }
                profilePicUrl = await uploadToS3(profilePic, "client", "profile-pic", client.username);
            }

            // let e_signaturesUrl = client.e_signatures;
            // if (e_signatures) {
            //     if (client.e_signatures) {
            //         const key = decodeURIComponent(client.e_signatures.split(".com/").pop());
            //         const s3Params = {
            //             Bucket: s3.config.bucketName,
            //             Key: key,
            //         };
            //         try {
            //             await s3.deleteObject(s3Params).promise();
            //         } catch (error) {
            //             console.error('Error deleting old signature:', error);
            //         }
            //     }
            //     e_signaturesUrl = await uploadToS3(e_signatures, "client", "signatures", client.username, client.created_by);
            // }

            await client.update({
                firstName, lastName, phoneCode, phone, bankname, website, profilePic: profilePicUrl || null, ifsc, banklocation, accountholder, accountnumber, gstIn,
                city, state, country, zipcode, address, accounttype, storage_limit, storage_used, updated_by: req.user?.username
            });
            return responseHandler.success(res, "Client updated successfully", client);

        } catch (error) {
            return responseHandler.error(res, error?.message);
        }
    }
};