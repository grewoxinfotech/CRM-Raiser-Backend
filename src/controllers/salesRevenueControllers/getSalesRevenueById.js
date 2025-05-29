import Joi from "joi";
import SalesRevenues from "../../models/salesRevenueModel.js";
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
            const salesRevenue = await SalesRevenues.findByPk(id);
            if (!salesRevenue) {
                return responseHandler.error(res, "SalesRevenue not found");
            }
            return responseHandler.success(res, "SalesRevenue fetched successfully", salesRevenue);
        } catch (error) {
            return responseHandler.error(res, error?.message);
        }
    }
}   