import Joi from "joi";
import Currency from "../../models/currencyModel.js";
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
            const Currencys = await Currency.findByPk(id);
            await Currencys.destroy();
            return responseHandler.success(res, "Currency deleted successfully", Currencys);
        } catch (error) {
            return responseHandler.error(res, error);
        }
    }
}