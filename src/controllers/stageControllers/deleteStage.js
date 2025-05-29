import Joi from "joi";
import Stage from "../../models/stageModel.js";
import Pipeline from "../../models/pipelineModel.js";
import validator from "../../utils/validator.js";
import responseHandler from "../../utils/responseHandler.js";

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

export default {
    validator: validator({
        params: Joi.object({
            id: Joi.string().required()
        }),
        query: Joi.object({
            newDefaultId: Joi.string().optional(),
            client_id: Joi.boolean().optional()
        })
    }),
    handler: async (req, res) => {
        try {
            const { id } = req.params;
            const newDefaultId = req.body.newDefaultId || req.query.newDefaultId;

            // Get the stage to delete
            const stageToDelete = await Stage.findByPk(id);
            if (!stageToDelete) {
                return responseHandler.error(res, "Stage not found");
            }

            // Get pipeline details
            const pipeline = await Pipeline.findByPk(stageToDelete.pipeline);
            if (!pipeline) {
                return responseHandler.error(res, "Pipeline not found");
            }

            const pipelineType = pipeline.pipeline_name.toLowerCase();

            // Get all stages of same type and pipeline
            const relatedStages = await Stage.findAll({
                where: {
                    stageType: stageToDelete.stageType,
                    pipeline: stageToDelete.pipeline,
                    client_id: stageToDelete.client_id
                }
            });

            // If deleting a default stage and there are other stages remaining
            if (stageToDelete.isDefault && relatedStages.length > 1) {
                if (!newDefaultId) {
                    // Return 400 status with remaining stages
                    return res.status(400).json({
                        success: false,
                        message: "Must specify new default stage when deleting a default stage",
                        data: {
                            remainingStages: relatedStages.filter(stage => stage.id !== id)
                        }
                    });
                }

                // Update the new default stage
                await Stage.update(
                    { isDefault: true },
                    { where: { id: newDefaultId } }
                );
            }

            // Delete the stage
            await stageToDelete.destroy();

            // Check if all stages of this type/pipeline are deleted
            const remainingStages = await Stage.findAll({
                where: {
                    stageType: stageToDelete.stageType,
                    pipeline: stageToDelete.pipeline,
                    client_id: stageToDelete.client_id
                }
            });

            // If no stages remain, trigger recreation of default stages
            if (remainingStages.length === 0) {
                const defaultStageSet = defaultStages[pipelineType]?.[stageToDelete.stageType] || [];
                const stagesToCreate = defaultStageSet.map(stage => ({
                    stageType: stageToDelete.stageType,
                    stageName: stage.stageName,
                    pipeline: stageToDelete.pipeline,
                    client_id: stageToDelete.client_id,
                    created_by: null,
                    isDefault: stage.isDefault
                }));

                if (stagesToCreate.length > 0) {
                    const createdStages = await Stage.bulkCreate(stagesToCreate);
                    return responseHandler.success(res, "Stage deleted and default stages recreated", {
                        recreatedStages: createdStages
                    });
                }
            }

            return responseHandler.success(res, "Stage deleted successfully");

        } catch (error) {
            console.error("Error in deleteStage:", error);
            return responseHandler.error(res, error?.message);
        }
    }
};
