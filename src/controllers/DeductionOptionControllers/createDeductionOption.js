import Joi from "joi";
import validator from "../../utils/validator.js";
import DeductionOption from "../../models/DeductionOptionModel.js";
import responseHandler from "../../utils/responseHandler.js";

export default {
    validator: validator({
        body: Joi.object({
            name: Joi.string().required(),
        })
    }),
    handler: async (req, res) => {
        try {
            const { name } = req.body;
            const existingDeductionOption = await DeductionOption.findOne({ where: { name } });
            if (existingDeductionOption) {
                return responseHandler.error(res, "Deduction option already exists");
            }
            const deductionOption = await DeductionOption.create({
                name,
                client_id: req.des?.client_id,
                created_by: req.user?.username,
            });
            return responseHandler.success(res, "Deduction option created successfully", deductionOption);
        } catch (error) {
            return responseHandler.error(res, error?.message);
        }
    }
}