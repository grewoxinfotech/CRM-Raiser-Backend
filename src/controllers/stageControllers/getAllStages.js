import Joi from "joi";
import Stage from "../../models/stageModel.js";
import validator from "../../utils/validator.js";
import responseHandler from "../../utils/responseHandler.js";
import User from "../../models/userModel.js";
import { Op } from "sequelize";
import { seedDefaultStages } from "./createStage.js";
import Pipeline from "../../models/pipelineModel.js";

export default {
    validator: validator({
        query: Joi.object({
            page: Joi.number().optional(),
            limit: Joi.number().optional(),
        })
    }),
    handler: async (req, res) => {
        try {
            const user = await User.findOne({
                where: { id: req.user.id }
            });

            // Get existing stages
            let stages = await Stage.findAll({
                where: {
                    [Op.or]: [{ client_id: user.client_id }, { client_id: user.id }]
                }
            });

            if (stages.length === 0) {
                // Use user.id as client_id for seeding if user is client, otherwise use user.client_id
                const client_id = user.client_id || user.id;

                // Get all pipelines first
                const pipelines = await Pipeline.findAll({
                    where: {
                        [Op.or]: [{ client_id: user.client_id }, { client_id: user.id }]
                    }
                });

                // Create stages for each pipeline
                const allStages = [];
                for (const pipeline of pipelines) {
                    const pipelineStages = await seedDefaultStages(pipeline.id, client_id, req.user.username);
                    allStages.push(...pipelineStages);
                }
                stages = allStages;
            }

            return responseHandler.success(res, "Stages fetched successfully", stages);

        } catch (error) {
            return responseHandler.error(res, error?.message);
        }
    }
}
