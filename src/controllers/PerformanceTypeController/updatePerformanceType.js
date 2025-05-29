import Joi from "joi";
import PerformanceType from "../../models/PerformanceTypeModel.js";
import responseHandler from "../../utils/responseHandler.js";
import validator from "../../utils/validator.js";
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
            const performanceTypeToUpdate = await PerformanceType.findByPk(id);
            if (!performanceTypeToUpdate) {
                return responseHandler.error(res, "Performance type not found");
            }
            const existingPerformanceType = await PerformanceType.findOne({ where: { name, id: { [Op.not]: id } } });
            if (existingPerformanceType) {
                return responseHandler.error(res, "Performance type already exists");
            }
            await performanceTypeToUpdate.update({ name, updated_by: req.user?.username });
            return responseHandler.success(res, "Performance type updated successfully", performanceTypeToUpdate);
        } catch (error) {
            return responseHandler.error(res, error?.message);
        }
    }
}