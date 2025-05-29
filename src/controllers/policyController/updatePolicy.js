import Joi from "joi";
import Policy from "../../models/policyModel.js";
import responseHandler from "../../utils/responseHandler.js";
import validator from "../../utils/validator.js";
import { Op } from "sequelize";
import { s3 } from "../../config/config.js";
import uploadToS3 from "../../utils/uploadToS3.js";

export default {
    validator: validator({
        params: Joi.object({
            id: Joi.string().required()
        }),
        body: Joi.object({
            title: Joi.string().optional(),
            description: Joi.string().optional(),
        })
    }),
    handler: async (req, res) => {
        try {
            const { id } = req.params;
            const file = req.file;
            const { title, description } = req.body;
            const policy = await Policy.findByPk(id);
            if (!policy) {
                return responseHandler.error(res, "Policy not found");
            }
            const existingPolicy = await Policy.findOne({ where: { title, id: { [Op.not]: id } } });
            if (existingPolicy) {
                return responseHandler.error(res, "Policy with this title already exists");
            }
            let fileUrl = policy.file;
            if (file) {
                if (policy.file) {
                    const key = decodeURIComponent(policy.file.split(".com/").pop());
                    const s3Params = {
                        Bucket: s3.config.bucketName,
                        Key: key,
                    };
                    // await s3.deleteObject(s3Params).promise();
                }
                fileUrl = await uploadToS3(file, "client", "policies", req.user?.username);
            }
            await policy.update({ title, description, file: fileUrl, updated_by: req.user?.username });
            return responseHandler.success(res, "Policy updated successfully", policy);
        } catch (error) {
            return responseHandler.error(res, error?.message);
        }
    }
}

