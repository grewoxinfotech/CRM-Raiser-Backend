import Joi from "joi";
import SalesInvoices from "../../models/salesInvoiceModel.js";
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
            const salesInvoice = await SalesInvoices.findByPk(id);
            if (!salesInvoice) {
                return responseHandler.error(res, "SalesInvoice not found");
            }
            return responseHandler.success(res, "SalesInvoice fetched successfully", salesInvoice);
        } catch (error) {
            return responseHandler.error(res, error?.message);
        }
    }
}   