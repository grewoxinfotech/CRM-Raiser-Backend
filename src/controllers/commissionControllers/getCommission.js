import Joi from "joi";
import validator from "../../utils/validator.js";
import Commission from "../../models/commissionModel.js";
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
            const commission = await Commission.findByPk(id);
            if (!commission) {
                return responseHandler.notFound(res, 'Commission not found');
            }
            return responseHandler.success(res, 'Commission found successfully', commission);
        } catch (error) {
            return responseHandler.error(res, error);
        }
    }
}