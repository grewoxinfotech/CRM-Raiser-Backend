import Joi from "joi";
import Contract from "../../models/contractModel.js";
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
            const contract = await Contract.findByPk(id);
            return responseHandler.success(res, "Contract fetched successfully", contract);
        } catch (error) {
            return responseHandler.error(res, "Internal server error");
        }
    }
}