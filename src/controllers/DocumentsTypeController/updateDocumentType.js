import Joi from "joi";
import DocumentType from "../../models/documentTypeModel.js";
import responseHandler from "../../utils/responseHandler.js";
import validator from "../../utils/validator.js";
import { Op } from "sequelize";

export default {
    validator: validator({
        params: Joi.object({
            id: Joi.string().required()
        }),
        body: Joi.object({
            name: Joi.string().required(),
            isRequired: Joi.boolean().required()
        })
    }),
    handler: async (req, res) => {
        try {
            const { name, isRequired } = req.body;
            const { id } = req.params;
            const documentType = await DocumentType.findByPk(id);
            if (!documentType) {
                return responseHandler.success(res, 'Document type not found');
            }
            const existingDocumentType = await DocumentType.findOne({ where: { name, id: { [Op.not]: id } } });
            if (existingDocumentType) {
                return responseHandler.error(res, 'Document type already exists');
            }
            await documentType.update({
                name,
                isRequired,
                updated_by: req.user?.username
            });
            return responseHandler.success(res, 'Document type updated successfully', documentType);
        }
        catch (error) {
            return responseHandler.error(res, error)
        }
    }
}