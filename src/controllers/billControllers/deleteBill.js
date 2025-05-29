import Joi from "joi";
import Bill from "../../models/billModel.js";
import responseHandler from "../../utils/responseHandler.js";
import validator from "../../utils/validator.js";

export default {
    validator: validator({
        params: Joi.object({
            id: Joi.string().required()
        }),
    }),
    handler: async (req, res) => {
        try {
            const { id } = req.params;

            const newBill = await Bill.findByPk(id);
            if (!newBill) {
                return responseHandler.error(res, "Bill not found");
            }
            await newBill.destroy();
            return responseHandler.success(res, "Bill deleted successfully", newBill);
        } catch (error) {
            return responseHandler.error(res, error?.message);
        }
    }
}