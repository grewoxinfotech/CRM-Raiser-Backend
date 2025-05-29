import Joi from "joi";
import validator from "../../utils/validator.js";
import responseHandler from "../../utils/responseHandler.js";
import Payroll from "../../models/payrollModel.js";

export default {
    validator: validator({
        body: Joi.object({
            name: Joi.string().required()
        })
    }),
    handler: async (req, res) => {
        try {
            const { name } = req.body;
            const payroll = await Payroll.create({ name,
                client_id: req.des?.client_id,
                created_by: req.user?.username });
            return responseHandler.success(res, "Payroll created successfully", payroll);
        } catch (error) {
            return responseHandler.error(res, error?.message);
        }
    }
};