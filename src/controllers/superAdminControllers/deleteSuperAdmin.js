import Joi from "joi";
import SuperAdmin from "../../models/superAdminModel.js";
import responseHandler from "../../utils/responseHandler.js";
import validator from "../../utils/validator.js";
import { s3 } from "../../config/config.js";

export default {
    validator: validator({
        params: Joi.object({
            id: Joi.string().required()
        })
    }),
    handler: async (req, res) => {
        try {
            const { id } = req.params;

            const superAdmin = await SuperAdmin.findByPk(id);
            if (!superAdmin) {
                return responseHandler.error(res, "superAdmin not found");
            }
            if (superAdmin.profilePic) {
                const key = decodeURIComponent(superAdmin.profilePic.split(".com/").pop());
                const s3Params = {
                    Bucket: s3.config.bucketName,
                    Key: key,
                };
                await s3.deleteObject(s3Params).promise();
            }
            await superAdmin.destroy();
            return responseHandler.success(res, "superAdmin deleted successfully", superAdmin);
        } catch (error) {
            return responseHandler.error(res, error?.message);
        }
    }
}
