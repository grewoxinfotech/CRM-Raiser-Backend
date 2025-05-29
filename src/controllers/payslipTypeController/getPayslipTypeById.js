import Joi from "joi";
import validator from "../../utils/validator.js";
import responseHandler from "../../utils/responseHandler.js";
import PayslipType from "../../models/payslipTypeModel.js";

export default {
    validator: validator({
        params: Joi.object({
            id: Joi.string().required()
        })
    }),
    handler: async (req, res) => {
        try {
            const { id } = req.params;
            const payslipType = await PayslipType.findByPk(id);
            if (!payslipType) {
                return responseHandler.error(res, "Payslip type not found");
            }
            return responseHandler.success(res, "Payslip type fetched successfully", payslipType);
        } catch (error) {
            return responseHandler.error(res, error?.message);
        }
    }
}