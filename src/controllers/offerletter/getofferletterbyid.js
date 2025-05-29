import Joi from "joi";
import validator from "../../utils/validator.js";
import responseHandler from "../../utils/responseHandler.js";
import OfferLetter from "../../models/offerletter.js";

export default {
    validator: validator({
        params: Joi.object({
            id: Joi.string().required()
        })
    }),
    handler: async (req, res) => {
        try {
            const { id } = req.params;
            const offerletter = await OfferLetter.findByPk(id);
            if (!offerletter) {
                return responseHandler.error(res, "Offer letter not found");
            }
            return responseHandler.success(res, "Offer letter fetched successfully", offerletter);
        } catch (error) {
            return responseHandler.error(res, error?.message);
        }
    }
}

