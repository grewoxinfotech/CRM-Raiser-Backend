import Joi from "joi";
import Policy from "../../models/policyModel.js";
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
            const policy = await Policy.findByPk(id);
            if (!policy) {
                return responseHandler.error(res, "Policy not found");
            }
            if (policy.file) {
                const key = decodeURIComponent(policy.file.split(".com/").pop());
                const s3Params = {
                    Bucket: s3.config.bucketName,
                    Key: key,
                };
                // await s3.deleteObject(s3Params).promise();
            }
            await policy.destroy();
            return responseHandler.success(res, "Policy deleted successfully", policy);
        } catch (error) {
            return responseHandler.error(res, error?.message);
        }
    }
}