import Joi from "joi";
import SuperAdmin from "../../models/superAdminModel.js";
import responseHandler from "../../utils/responseHandler.js";
import validator from "../../utils/validator.js";
import uploadToS3 from "../../utils/uploadToS3.js";
import { s3 } from "../../config/config.js";

export default {
    validator: validator({
        params: Joi.object({
            id: Joi.string().required()
        }),
        body: Joi.object({
            email: Joi.string().optional().allow('', null),
            firstName: Joi.string().optional().allow('', null),
            lastName: Joi.string().optional().allow('', null),
            phone: Joi.string().optional().allow('', null),
            profilePic: Joi.any(),
        })
    }),
    handler: async (req, res) => {
        try {
            const { id } = req.params;
            const profilePic = req.file;
            const { firstName, lastName, phone, email } = req.body;
            const skipDelete = req.query.skipDelete === 'true';

            const superAdmin = await SuperAdmin.findByPk(id);
            if (!superAdmin) {
                return responseHandler.notFound(res, "Super admin not found");
            }

            let profilePicUrl = superAdmin.profilePic;
            if (profilePic) {
                // Only attempt to delete if skipDelete is false
                if (superAdmin.profilePic && !skipDelete) {
                    try {
                        const key = decodeURIComponent(superAdmin.profilePic.split(".com/").pop());
                        const s3Params = {
                            Bucket: s3.config.bucketName,
                            Key: key,
                        };
                        await s3.deleteObject(s3Params).promise();
                    } catch (deleteError) {
                        console.error("Error deleting S3 object:", deleteError);
                    }
                }
                profilePicUrl = await uploadToS3(profilePic, "super-admin", "profile-pic", superAdmin.username);
            }

            await superAdmin.update({
                firstName,
                lastName,
                phone,
                email,
                profilePic: profilePicUrl,
                updated_by: req.user?.username
            });

            return responseHandler.success(res, "Super admin updated successfully", superAdmin);
        } catch (error) {
            return responseHandler.error(res, error);
        }
    }
};