import Joi from "joi";
import DocumentType from "../../models/documentTypeModel.js";
import responseHandler from "../../utils/responseHandler.js";
import validator from "../../utils/validator.js";

export default {
    validator: validator({
        body: Joi.object({
            name: Joi.string().required(),
            isRequired: Joi.boolean().required()
        })
    }),
    handler: async (req, res) => {
        try {
            const { name, isRequired } = req.body;
            const existingDocumentType = await DocumentType.findOne({ where: { name } });
            if (existingDocumentType) {
                return responseHandler.error(res, 'Document type already exists');
            }
            const documentType = await DocumentType.create({
                name,
                isRequired,
                client_id: req.des?.client_id,
                created_by: req.user?.username
            });
            return responseHandler.success(res, 'Document type created successfully', documentType);
        } catch (error) {
            return responseHandler.error(res, error?.message);
        }
    }
}