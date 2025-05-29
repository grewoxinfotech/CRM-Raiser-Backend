import Joi from "joi";
import validator from "../../utils/validator.js";
import Commission from "../../models/commissionModel.js";
import responseHandler from "../../utils/responseHandler.js";
import { Op } from "sequelize";

export default {
    validator: validator({
        params: Joi.object({
            id: Joi.string().required()
        }),
        body: Joi.object({
            title: Joi.string().required(),
            type: Joi.string().required(),
            currency: Joi.string().required(),
            amount: Joi.number().required(),
        })
    }),
    handler: async (req, res) => {
        try {
            const { id } = req.params;
            const { title, type, currency, amount } = req.body;
            const commission = await Commission.findByPk(id);
            if (!commission) {
                return responseHandler.notFound(res, 'Commission not found');
            }
            const EMP = await User.findOne({ where: { id: req.user?.id } });
            if (!EMP) {
                return responseHandler.error(res, "Employee not found");
            }
            const existingCommission = await Commission.findOne({ where: { employeeId: EMP.employeeId, id: { [Op.not]: id } } });
            if (existingCommission) {
                return responseHandler.error(res, "Commission already exists");
            }
            await commission.update({ title, type, currency, amount, updated_by: req.user?.username });

            return responseHandler.success(res, 'Commission updated successfully', commission);
        } catch (error) {
            return responseHandler.error(res, error);
        }
    }
}