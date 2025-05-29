import Tax from "../../models/taxModel.js";
import responseHandler from "../../utils/responseHandler.js";
import validator from "../../utils/validator.js";
import Joi from "joi";

export default {
    validator: validator({
        params: Joi.object({
            id: Joi.string().required()
        })
    }),
    handler: async (req, res) => {
        try {
            const { id } = req.params;
            const tax = await Tax.findByPk(id);
            await tax.destroy();
            return responseHandler.success(res, "Tax deleted successfully", tax);
        } catch (error) {
            return responseHandler.error(res, error);
        }
    }
}