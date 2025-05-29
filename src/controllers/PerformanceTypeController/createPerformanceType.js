import Joi from "joi";
import PerformanceType from "../../models/PerformanceTypeModel.js";
import responseHandler from "../../utils/responseHandler.js";
import validator from "../../utils/validator.js";

export default {
    validator: validator({
        body: Joi.object({
            name: Joi.string().required(),
        })
    }),
    handler: async (req, res) => {
        try {
            const { name } = req.body;
            const existingPerformanceType = await PerformanceType.findOne({ where: { name } });
            if (existingPerformanceType) {
                return responseHandler.error(res, "Performance type already exists");
            }
            const performancetype = await PerformanceType.create({ name,
                client_id: req.des?.client_id,
                created_by: req.user?.username });
            if (!performancetype) {
                return responseHandler.error(res, "Failed to create Performance type");
            }
            return responseHandler.success(res, "Performance type created successfully", performancetype);
        } catch (error) {
            return responseHandler.error(res, error?.message);
        }
    }
}