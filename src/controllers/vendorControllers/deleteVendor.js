import Joi from "joi";
import Vendor from "../../models/vendorModel.js";
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
            const { id } = req.params
            const vendor = await Vendor.findByPk(id)
            await vendor.destroy()
            return responseHandler.success(res, "Vendor deleted successfully", vendor)
        } catch (error) {
            return responseHandler.error(res, error.message)
        }
    }
}