import Joi from "joi";
import validator from "../../utils/validator.js";
import ESignature from "../../models/esignatureModel.js";
import responseHandler from "../../utils/responseHandler.js";
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
            const esignature = await ESignature.findByPk(id);
            if (!esignature) {
                return responseHandler.error(res, "E-signature not found");
            }

            if (esignature.e_signatures) {
                const key = decodeURIComponent(esignature.e_signatures.split(".com/").pop());
                const s3Params = {
                    Bucket: s3.config.bucketName,
                    Key: key,
                };
                try {
                    await s3.deleteObject(s3Params).promise();
                } catch (error) {
                    console.error('Error deleting signature file:', error);
                }
            }

            await esignature.destroy();
            return responseHandler.success(res, "E-signature deleted successfully", esignature);
        } catch (error) {
            return responseHandler.error(res, error?.message);
        }
    }
};
