import Joi from "joi";
import validator from "../../utils/validator.js";
import Allowance from "../../models/allowanceModel.js";
import responseHandler from "../../utils/responseHandler.js";
import User from "../../models/userModel.js";
import { Op } from "sequelize";

export default {
    validator: validator({
        params: Joi.object({
            id: Joi.string().required()
        }),
        body: Joi.object({
            allowanceOption: Joi.string().required(),
            title: Joi.string().required(),
            type: Joi.string().required(),
            currency: Joi.string().required(),
            amount: Joi.number().required(),
        })
    }),
    handler: async (req, res) => {
        try {
            const { id } = req.params;
            const { allowanceOption, title, type, currency, amount } = req.body;
            const allowance = await Allowance.findByPk(id);
            if (!allowance) {
                return responseHandler.notFound(res, 'Allowance not found');
            }
            const EMP = await User.findOne({ where: { id: req.user?.id } });
            if (!EMP) {
                return responseHandler.error(res, "Employee not found");
            }
            await allowance.update({ allowanceOption, title, type, currency, amount, updated_by: req.user?.username });
            return responseHandler.success(res, 'Allowance updated successfully', allowance);
        } catch (error) {
            return responseHandler.error(res, error);
        }
    }
}