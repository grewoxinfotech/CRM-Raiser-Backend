import Joi from "joi";
import validator from "../../utils/validator.js";
import AllowanceOption from "../../models/allowanceOptionModel.js";
import responseHandler from "../../utils/responseHandler.js";
import { Op } from "sequelize";

export default {
    validator: validator({
        params: Joi.object({
            id: Joi.string().required()
        }),
        body: Joi.object({
            name: Joi.string().required(),
        })
    }),
    handler: async (req, res) => {
        try {
            const { id } = req.params;
            const { name } = req.body;
            const allowanceOption = await AllowanceOption.findByPk(id);
            if (!allowanceOption) {
                return responseHandler.error(res, "Allowance option not found");
            }
            const existingAllowanceOption = await AllowanceOption.findOne({ where: { name, id: { [Op.not]: id } } });
            if (existingAllowanceOption) {
                return responseHandler.error(res, "Allowance option already exists");
            }
            await allowanceOption.update({
                name,
                updated_by: req.user?.username
            });
            return responseHandler.success(res, "Allowance option updated successfully", allowanceOption);
        } catch (error) {
            return responseHandler.error(res, error?.message);
        }
    }
}
