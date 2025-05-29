import Joi from "joi";
import validator from "../../utils/validator.js";
import responseHandler from "../../utils/responseHandler.js";
import ESignature from "../../models/esignatureModel.js";
import uploadToS3 from "../../utils/uploadToS3.js";
import { s3 } from '../../config/config.js';
export default {
    validator: validator({
        body: Joi.object({
            esignature_name: Joi.string().required(),
            // user_id: Joi.string().required()
        })
    }),
    handler: async (req, res) => {
        try {
            const { esignature_name } = req.body;
            const e_signatures = req.files?.e_signatures?.[0];
            if (!e_signatures) {
                return responseHandler.error(res, "E-signature file is required");
            }

            let esignatureUrl = e_signatures;
            if (e_signatures) {
                if (e_signatures.e_signatures) {
                    const key = decodeURIComponent(e_signatures.split(".com/").pop());
                    const s3Params = {
                        Bucket: s3.config.bucketName,
                        Key: key,
                    };
                    try {
                        await s3.deleteObject(s3Params).promise();
                    } catch (error) {
                        console.error('Error deleting old signature:', error);
                    }
                }
                esignatureUrl = await uploadToS3(e_signatures, "esignatures", esignature_name, req.user?.username);
            }
            const newESignature = await ESignature.create({
                esignature_name,
                related_id: req.user?.id,
                client_id: req.des?.client_id,
                e_signatures: esignatureUrl,
                created_by: req.user?.username
            });
            return responseHandler.success(res, "E-signature created successfully", newESignature);
        } catch (error) {
            return responseHandler.error(res, error?.message);
        }
    }
};