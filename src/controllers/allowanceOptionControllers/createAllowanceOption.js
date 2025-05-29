import Joi from "joi";
import validator from "../../utils/validator.js";
import AllowanceOption from "../../models/allowanceOptionModel.js";
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
            const existingAllowanceOption = await AllowanceOption.findOne({ where: { name: name } });
            if (existingAllowanceOption) {
                return responseHandler.error(res, "Allowance option already exists");
            }
            const allowanceOption = await AllowanceOption.create({
                name,
                client_id: req.des?.client_id,
                created_by: req.user?.username,
            });
            return responseHandler.success(res, "Allowance option created successfully", allowanceOption);
        } catch (error) {
            return responseHandler.error(res, error?.message);
        }
    }
}