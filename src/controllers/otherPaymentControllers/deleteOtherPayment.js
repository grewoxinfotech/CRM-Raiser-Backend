import Joi from "joi";
import validator from "../../utils/validator.js";
import OtherPayment from "../../models/otherPaymentModel.js";
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
            const otherPayment = await OtherPayment.findByPk(id);
            if (!otherPayment) {
                return responseHandler.notFound(res, 'OtherPayment not found');
            }
            await otherPayment.destroy();
            return responseHandler.success(res, 'OtherPayment deleted successfully', otherPayment);
        } catch (error) {
            return responseHandler.error(res, error);
        }
    }
}