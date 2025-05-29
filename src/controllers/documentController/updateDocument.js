import Joi from "joi";
import Document from "../../models/documentModel.js";
import responseHandler from "../../utils/responseHandler.js";
import validator from "../../utils/validator.js";
import { Op } from "sequelize";
import uploadToS3 from "../../utils/uploadToS3.js";
import { s3 } from "../../config/config.js";

export default {
    validator: validator({
        params: Joi.object({
            id: Joi.string().required()
        }),
        body: Joi.object({
            name: Joi.string().optional(),
            role: Joi.string().optional(),
            description: Joi.string().optional().allow('', null),
        })
    }),
    handler: async (req, res) => {
        try {
            const { id } = req.params;
            const { name, role, description } = req.body;
            const file = req.file;

            const document = await Document.findByPk(id);
            if (!document) {
                return responseHandler.error(res, "Document not found");
            }

            const existingDocument = await Document.findOne({ where: { name, id: { [Op.not]: id } } });
            if (existingDocument) {
                return responseHandler.error(res, "Document with this name already exists");
            }

            let fileUrl = document.file;
            if (file) {
                if (document.file) {
                    const key = decodeURIComponent(document.file.split(".com/").pop());
                    const s3Params = {
                        Bucket: s3.config.bucketName,
                        Key: key,
                    };
                    await s3.deleteObject(s3Params).promise();
                }
                fileUrl = await uploadToS3(file, "client", "documents", req.user?.username);
            }

            await document.update({
                name,
                role,
                description,
                file: fileUrl,
                updated_by: req.user?.username
            });

            return responseHandler.success(res, "Document updated successfully", document);
        } catch (error) {
            return responseHandler.error(res, error?.message);
        }
    }
}