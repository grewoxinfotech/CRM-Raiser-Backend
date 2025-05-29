import Joi from "joi";
import Document from "../../models/documentModel.js";
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
            const document = await Document.findByPk(id);
            if (!document) {
                return responseHandler.error(res, "Document not found");
            }
            const file = document.file;
            if (file) {
                const key = decodeURIComponent(file.split(".com/").pop());
                const s3Params = {
                    Bucket: s3.config.bucketName,
                    Key: key,
                };
                await s3.deleteObject(s3Params).promise();
            }
            await document.destroy();
            return responseHandler.success(res, "Document deleted successfully", document);
        } catch (error) {
            return responseHandler.error(res, error?.message);
        }
    }
}