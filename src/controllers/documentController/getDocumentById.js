import Joi from "joi";
import Document from "../../models/documentModel.js";
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
            const document = await Document.findByPk(id);
            if (!document) {
                return responseHandler.error(res, "Document not found");
            }
            return responseHandler.success(res, "Document fetched successfully", document);
        } catch (error) {
            return responseHandler.error(res, error?.message);
        }
    }
}