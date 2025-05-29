import Joi from "joi";
import responseHandler from "../../utils/responseHandler.js";
import validator from "../../utils/validator.js";
import User from "../../models/userModel.js";
import uploadToS3 from "../../utils/uploadToS3.js";
import { s3 } from "../../config/config.js";

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
            gender: Joi.string().valid('male', 'female', 'other').optional().allow('', null),
            accountholder: Joi.string().optional().allow('', null),
            accountnumber: Joi.number().optional().allow('', null),
            bankname: Joi.string().optional().allow('', null),
            ifsc: Joi.string().optional().allow('', null),
            banklocation: Joi.string().optional().allow('', null),
            accounttype: Joi.string().valid('savings', 'current', 'other').optional().allow('', null),
            website: Joi.string().optional().allow('', null),
            gstIn: Joi.string().optional().allow('', null),
            address: Joi.string().optional().allow('', null),
            city: Joi.string().optional().allow('', null),
            state: Joi.string().optional().allow('', null),
            country: Joi.string().optional().allow('', null),
            zipcode: Joi.string().optional().allow('', null),
        })
    }),
    handler: async (req, res) => {
        try {
            const profilePic = req.files?.profilePic?.[0];
            const { id } = req.params;
            const {
                firstName, lastName, phoneCode, phone, gender,
                accountholder, accountnumber, bankname, ifsc,
                banklocation, accounttype,
                website, gstIn,
                address, city, state, country, zipcode,
            } = req.body;

            const subClient = await User.findByPk(id);
            if (!subClient) {
                return responseHandler.notFound(res, "subClient not found");
            }

            let profilePicUrl = subClient.profilePic;
            if (profilePic) {
                if (subClient.profilePic) {
                    const key = decodeURIComponent(subClient.profilePic.split(".com/").pop());
                    const s3Params = {
                        Bucket: s3.config.bucketName,
                        Key: key,
                    };
                    // await s3.deleteObject(s3Params).promise();
                }
                profilePicUrl = await uploadToS3(profilePic, "sub-client", "profile-pic", subClient.username, subClient.created_by);
            }


            await subClient.update({
                firstName, lastName, phoneCode, phone, gender,
                accountholder, accountnumber, bankname, ifsc,
                banklocation, accounttype,
                website, gstIn,
                address, city, state, country, zipcode, profilePic: profilePicUrl,
                updated_by: req.user?.username
            });
            return responseHandler.success(res, "SubClient updated successfully", subClient);
        } catch (error) {
            console.log(error);
            return responseHandler.error(res, error?.message);
        }
    }
};
