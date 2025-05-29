import Joi from "joi";
import Pipeline from "../../models/pipelineModel.js";
import responseHandler from "../../utils/responseHandler.js";
import validator from "../../utils/validator.js";
import User from "../../models/userModel.js";
import { Op } from "sequelize";
import { seedDefaultPipelines } from "./createPipeline.js";
import { seedDefaultStages } from "../stageControllers/createStage.js";

export default {
    validator: validator({
        query: Joi.object({
            page: Joi.number().optional(),
            limit: Joi.number().optional()
        })
    }),
    handler: async (req, res) => {
        try {
            const user = await User.findOne({
                where: { id: req.user.id }
            });

            // Get existing pipelines
            let pipelines = await Pipeline.findAll({
                where: {
                    [Op.or]: [{ client_id: user.client_id }, { client_id: user.id }]
                }
            });

            if (pipelines.length === 0) {
                // Use user.id as client_id for seeding if user is client, otherwise use user.client_id
                const client_id = user.client_id || user.id;
                pipelines = await seedDefaultPipelines(client_id, req.user.username);

                for (const pipeline of pipelines) {
                    await seedDefaultStages(
                        pipeline.id,
                        client_id,
                        req.user.username
                    );
                }
            }

            return responseHandler.success(res, "Pipelines fetched successfully", pipelines);

        } catch (error) {
            return responseHandler.error(res, error?.message);
        }
    }
}