import Joi from "joi";
import validator from "../../utils/validator.js";
import responseHandler from "../../utils/responseHandler.js";
import PayslipType from "../../models/payslipTypeModel.js";

export default {
    validator: validator({
        body: Joi.object({
            name: Joi.string().required()
        })
    }),
    handler: async (req, res) => {
        try {
            const { name } = req.body;
            const existingPayslipType = await PayslipType.findOne({ where: { name } });
            if (existingPayslipType) {
                return responseHandler.error(res, "Payslip type already exists");
            }
            const payslipType = await PayslipType.create({ name,
                client_id: req.des?.client_id,
                created_by: req.user?.username });
            if (!payslipType) {
                return responseHandler.error(res, "Failed to create payslip type");
            }
            return responseHandler.success(res, "Payslip type created successfully", payslipType);
        } catch (error) {
            return responseHandler.error(res, error?.message);
        }
    }
}