import Joi from "joi";
import validator from "../../utils/validator.js";
import Feature from "../../models/featureModel.js";
import responseHandler from "../../utils/responseHandler.js";
import { Op } from "sequelize";

export default {
    validator: validator({
        params: Joi.object({
            id: Joi.string().required()
        }),
        body: Joi.object({
            featureName: Joi.string().required()
        })
    }),
    handler: async (req, res) => {
        const { id } = req.params;
        const { featureName } = req.body;
        try {
            const feature = await Feature.findByPk(id);
            if (!feature) {
                return responseHandler.error(res, "Feature not found");
            }
            const existingFeature = await Feature.findOne({ where: { featureName, id: { [Op.not]: id } } });
            if (existingFeature) {
                return responseHandler.error(res, "Feature already exists");
            }
            await feature.update({ featureName, updated_by: req.user.username });
            return responseHandler.success(res, "Feature updated successfully", feature);
        } catch (error) {
            return responseHandler.error(res, error?.message);
        }
    }
}   