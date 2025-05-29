import Joi from "joi";
import validator from "../../utils/validator.js";
import responseHandler from "../../utils/responseHandler.js";
import Quotations from "../../models/quotationModel.js";

export default {
    validator: validator({
        params: Joi.object({
            id: Joi.string().required()
        })
    }),
    handler: async (req, res) => {
        try {
            const { id } = req.params;

            const quotation = await Quotations.findByPk(id);

            if (!quotation) {
                return responseHandler.notFound(res, "Quotation not found");
            }

            await quotation.destroy();

            return responseHandler.success(res, "Quotation deleted successfully", quotation);
        } catch (error) {

            return responseHandler.error(res, error?.message);
        }
    }
};   