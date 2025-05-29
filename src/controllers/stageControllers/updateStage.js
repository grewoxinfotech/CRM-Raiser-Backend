import Joi from "joi";
import Stage from "../../models/stageModel.js";
import validator from "../../utils/validator.js";
import responseHandler from "../../utils/responseHandler.js";
import { Op } from "sequelize";

export default {
    validator: validator({
        params: Joi.object({
            id: Joi.string().required()
        }),
        body: Joi.object({
            stageName: Joi.string().required(),
            pipeline: Joi.string().required(),
            isDefault: Joi.boolean().required()
        })
    }),
    handler: async (req, res) => {
        try {
            const { id } = req.params;
            const { stageName, pipeline, isDefault } = req.body;
            const stage = await Stage.findByPk(id)
            if (!stage) {
                return responseHandler.notFound(res, "Stage not found");
            }
            const existingStage = await Stage.findOne({ where: { stageName, pipeline, id: { [Op.not]: id } } });
            if (existingStage) {
                return responseHandler.error(res, "Stage already exists");
            }
            await stage.update({ stageName, pipeline, isDefault: isDefault || false, updated_by: req.user.username });
            return responseHandler.success(res, "Stage updated successfully", stage);
        } catch (error) {
            return responseHandler.error(res, error?.message);
        }
    }
}
