import Joi from "joi";
import SalesQuotations from "../../models/salesQuotationModel.js";
import validator from "../../utils/validator.js";
import responseHandler from "../../utils/responseHandler.js";

export default {
    validator: validator({
        params: Joi.object({
            id: Joi.string().required()
        })
    }),
    handler: async (req, res) => {
        try {
            const { id } = req.params;
            const salesQuotation = await SalesQuotations.findByPk(id);
            if (!salesQuotation) {
                return responseHandler.error(res, "SalesQuotation not found");
            }
            await salesQuotation.destroy();
            return responseHandler.success(res, "SalesQuotation deleted successfully", salesQuotation);
        } catch (error) {
            return responseHandler.error(res, error?.message);
        }
    }
}   