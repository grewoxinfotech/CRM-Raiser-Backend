import Joi from "joi";
import validator from "../../utils/validator.js";
import responseHandler from "../../utils/responseHandler.js";
import PayslipType from "../../models/payslipTypeModel.js";
import { Op } from "sequelize";

export default {
    validator: validator({
        params: Joi.object({
            id: Joi.string().required()
        }),
        body: Joi.object({
            name: Joi.string().required()
        })
    }),
    handler: async (req, res) => {
        try {
            const { id } = req.params;
            const { name } = req.body;
            const payslipType = await PayslipType.findOne({ where: { id } });
            if (!payslipType) {
                return responseHandler(res, "Payslip type not found");
            }
            const existingPayslipType = await PayslipType.findOne({ where: { name, id: { [Op.not]: id } } });
            if (existingPayslipType) {
                return responseHandler.error(res, "Payslip type already exists");
            }
            await payslipType.update({ name, updated_by: req.user?.username });
            return responseHandler.success(res, "Payslip type updated successfully", payslipType);
        } catch (error) {
            return responseHandler.error(res, error?.message);
        }
    }
}