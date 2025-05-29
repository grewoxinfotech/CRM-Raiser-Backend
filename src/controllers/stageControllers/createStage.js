import Joi from "joi";
import Stage from "../../models/stageModel.js";
import validator from "../../utils/validator.js";
import responseHandler from "../../utils/responseHandler.js";
import Pipeline from "../../models/pipelineModel.js";

const defaultStages = {
    'sales': {
        'lead': [
            { stageName: 'New Lead', isDefault: true },
            { stageName: 'Contacted', isDefault: false },
            { stageName: 'Qualified', isDefault: false },
            { stageName: 'Lost', isDefault: false }
        ],
        'deal': [
            { stageName: 'New Deal', isDefault: true },
            { stageName: 'Proposal', isDefault: false },
            { stageName: 'Negotiation', isDefault: false },
            { stageName: 'Closed', isDefault: false }
        ]
    },
    'marketing': {
        'lead': [
            { stageName: 'New Contact', isDefault: true },
            { stageName: 'Email Campaign', isDefault: false },
            { stageName: 'MQL', isDefault: false },
            { stageName: 'SQL', isDefault: false }
        ],
        'deal': [
            { stageName: 'New Campaign', isDefault: true },
            { stageName: 'Planning', isDefault: false },
            { stageName: 'Content Creation', isDefault: false },
            { stageName: 'Completed', isDefault: false }
        ]
    }
};

export const seedDefaultStages = async (pipeline_id, client_id, username) => {
    try {
        const pipeline = await Pipeline.findOne({
            where: {
                id: pipeline_id,
                client_id
            }
        });

        if (!pipeline) {
            console.error('Pipeline not found:', { pipeline_id, client_id });
            return [];
        }

        const existingStages = await Stage.findAll({
            where: {
                pipeline: pipeline_id,
                client_id
            }
        });

        if (existingStages.length === 0) {
            const pipelineType = pipeline.pipeline_name.toLowerCase();
            const allStages = [];

            for (const stageType of ['lead', 'deal']) {
                const stageSet = defaultStages[pipelineType]?.[stageType] || [];

                const stagesToCreate = stageSet.map(stage => ({
                    stageName: stage.stageName,
                    stageType: stageType,
                    pipeline: pipeline_id,
                    isDefault: stage.isDefault,
                    client_id,
                    created_by: username
                }));

                if (stagesToCreate.length > 0) {
                    try {
                        const createdStages = await Stage.bulkCreate(stagesToCreate);
                        allStages.push(...createdStages);
                    } catch (error) {
                        console.error('Error creating stages:', error.message);
                    }
                }
            }

            return allStages;
        }

        return existingStages;
    } catch (error) {
        console.error('Error in seedDefaultStages:', error.message);
        throw error;
    }
};

export const createStage = async (req, res) => {
    try {
        const { stageType, stageName, pipeline, client_id, created_by } = req.body;

        // Get pipeline details
        const pipelineDetails = await Pipeline.findByPk(pipeline);
        if (!pipelineDetails) {
            return responseHandler.error(res, "Pipeline not found");
        }

        const pipelineType = pipelineDetails.pipeline_name.toLowerCase();

        // Check if this is a custom stage creation
        if (stageName) {
            const newStage = await Stage.create({
                stageType,
                stageName,
                pipeline,
                client_id,
                created_by,
                isDefault: false
            });
            return responseHandler.success(res, "Stage created successfully", newStage);
        }

        // Check if we need to create default stages
        const existingStages = await Stage.findAll({
            where: {
                stageType,
                pipeline,
                client_id
            }
        });

        // Only create default stages if none exist for this pipeline/type combination
        if (existingStages.length === 0) {
            const defaultStageSet = defaultStages[pipelineType]?.[stageType] || [];
            const stagesToCreate = defaultStageSet.map(stage => ({
                stageType,
                stageName: stage.stageName,
                pipeline,
                client_id,
                created_by,
                isDefault: stage.isDefault
            }));

            if (stagesToCreate.length > 0) {
                const createdStages = await Stage.bulkCreate(stagesToCreate);
                return responseHandler.success(res, "Default stages created successfully", createdStages);
            }
        }

        return responseHandler.error(res, "Invalid stage creation request");

    } catch (error) {
        console.error("Error in createStage:", error);
        return responseHandler.error(res, error?.message);
    }
};

export default {
    validator: validator({
        body: Joi.object({
            stageType: Joi.string().valid('lead', 'deal').required(),
            stageName: Joi.string().required(),
            pipeline: Joi.string().required(),
            isDefault: Joi.boolean().default(false)
        })
    }),
    handler: async (req, res) => {
        try {
            const { stageType, stageName, pipeline, isDefault } = req.body;
            const existingStage = await Stage.findOne({ where: { stageName, pipeline } });
            if (existingStage) {
                return responseHandler.error(res, "Stage already exists");
            }
            const stage = await Stage.create({
                stageType,
                stageName,
                pipeline,
                isDefault,
                client_id: req.des?.client_id,
                created_by: req.user.username,
            });
            return responseHandler.success(res, "Stage created successfully", stage);
        } catch (error) {
            return responseHandler.error(res, error?.message);
        }
    }
}
