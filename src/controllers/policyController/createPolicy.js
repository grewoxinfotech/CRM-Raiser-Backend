import Joi from "joi";
import Policy from "../../models/policyModel.js";
import responseHandler from "../../utils/responseHandler.js";
import validator from "../../utils/validator.js";
import uploadToS3 from "../../utils/uploadToS3.js";

export default {
    validator: validator({
        body: Joi.object({

            title: Joi.string().required(),
            description: Joi.string().optional().allow('', null),
        })
    }),
    handler: async (req, res) => {
        try {
            const file = req.file;
            const { title, description } = req.body;
            const existingPolicy = await Policy.findOne({ where: { title } });
            if (existingPolicy) {
                return responseHandler.error(res, "Policy already exists");
            }
            const uploadedFile = await uploadToS3(file, "client", "policies", req.user?.username);
            const policy = await Policy.create({ title, description, file: uploadedFile, created_by: req.user?.username });
            return responseHandler.success(res, "Policy created successfully", policy);
        } catch (error) {
            return responseHandler.error(res, error?.message);
        }
    }
}