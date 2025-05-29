import Joi from "joi";
import validator from "../../utils/validator.js";
import Feature from "../../models/featureModel.js";
import responseHandler from "../../utils/responseHandler.js";

export default {
    validator: validator({
        body: Joi.object({
            featureName: Joi.string().required()
        })
    }),

    handler: async (req, res) => {
        try {
            const { featureName } = req.body;
            const existingFeature = await Feature.findOne({ where: { featureName } });
            if (existingFeature) {
                return responseHandler.error(res, "Feature already exists");
            }
            const feature = await Feature.create({ featureName, client_id: req.des?.client_id, created_by: req.user.username });
            return responseHandler.success(res, "Feature created successfully", feature);
        } catch (error) {
            return responseHandler.error(res, error?.message);
        }
    }
}