import Country from "../../models/countriesModel.js";
import responseHandler from "../../utils/responseHandler.js";
import validator from "../../utils/validator.js";
import Joi from "joi";

export default {
    validator: validator,
    params: Joi.object({
        id: Joi.string().required()
    }),
    handler: async (req, res) => {
        try {
            const { id } = req.params;
            const country = await Country.findByPk(id);
            return responseHandler.success(res, "Country fetched successfully", country);
        } catch (error) {
            return responseHandler.error(res, error?.message);
        }
    }
}