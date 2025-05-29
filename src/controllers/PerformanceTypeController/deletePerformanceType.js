import Joi from "joi";
import validator from "../../utils/validator.js";
import PerformanceType from "../../models/PerformanceTypeModel.js";
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
            const performanceType = await PerformanceType.findByPk(id);
            if (!performanceType) {
                return responseHandler.error(res, "Performance type not found");
            }
            await performanceType.destroy();
            return responseHandler.success(res, "Performance type deleted successfully", performanceType);
        } catch (error) {
            return responseHandler.error(res, error?.message);
        }
    }
}