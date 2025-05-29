import Joi from "joi";
import responseHandler from "../../utils/responseHandler.js";
import validator from "../../utils/validator.js";
import User from "../../models/userModel.js";
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

            const subClient = await User.findByPk(id);
            if (!subClient) {
                return responseHandler.error(res, "subClient not found");
            }

            if (subClient.profilePic) {
                const key = decodeURIComponent(subClient.profilePic.split(".com/").pop());
                const s3Params = {
                    Bucket: s3.config.bucketName,
                    Key: key,
                };
                // await s3.deleteObject(s3Params).promise();
            }

            if (subClient.e_signatures) {
                const key = decodeURIComponent(subClient.e_signatures.split(".com/").pop());
                const s3Params = {
                    Bucket: s3.config.bucketName,
                    Key: key,
                };
                await s3.deleteObject(s3Params).promise();
            }

            await subClient.destroy();
            return responseHandler.success(res, "subClient deleted successfully", subClient);
        } catch (error) {
            return responseHandler.error(res, error?.message);
        }
    }
}