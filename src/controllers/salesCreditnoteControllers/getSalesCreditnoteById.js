import Joi from "joi";
import SalesCreditnotes from "../../models/salesCreditnoteModel.js";
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
            const salesCreditnote = await SalesCreditnotes.findByPk(id);
            if (!salesCreditnote) {
                return responseHandler.error(res, "SalesCreditnote not found");
            }
            return responseHandler.success(res, "SalesCreditnote fetched successfully", salesCreditnote);
        } catch (error) {
            return responseHandler.error(res, error?.message);
        }
    }
}   