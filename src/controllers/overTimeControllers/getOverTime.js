import Joi from "joi";
import validator from "../../utils/validator.js";
import OverTime from "../../models/overTimeModel.js";
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
            const overTime = await OverTime.findByPk(id);
            if (!overTime) {
                return responseHandler.notFound(res, 'OverTime not found');
            }
            return responseHandler.success(res, 'OverTime found successfully', overTime);
        } catch (error) {
            return responseHandler.error(res, error);
        }
    }
}