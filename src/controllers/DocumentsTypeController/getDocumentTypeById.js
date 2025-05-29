import Joi from "joi";
import DocumentType from "../../models/documentTypeModel.js";
import responseHandler from "../../utils/responseHandler.js";
import validator from "../../utils/validator.js";

export default {
    validator: validator({
        params: Joi.object({
            id: Joi.string().required()
        })
    }),
    handler: async (req, res) => {
        try {
            const { id } = req.params;
            const documentType = await DocumentType.findByPk(id);
            if (!documentType) {
                return responseHandler.error(res, 'Document type not found');
            }
            return responseHandler.success(res, 'Document type fetched successfully', documentType);
        } catch (error) {
            return responseHandler.error(res, error?.message);
        }
    }
}