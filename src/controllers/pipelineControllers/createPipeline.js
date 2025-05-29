import Joi from "joi";
import Pipeline from "../../models/pipelineModel.js";
import responseHandler from "../../utils/responseHandler.js";
import validator from "../../utils/validator.js";

export const defaultPipelines = [
    { pipeline_name: "Sales" },
    { pipeline_name: "Marketing" }
];

export const seedDefaultPipelines = async (client_id, username) => {
    try {
        const existingPipelines = await Pipeline.findAll({
            where: { client_id }
        });

        if (existingPipelines.length === 0) {
            const createdPipelines = await Promise.all(
                defaultPipelines.map(async (pipeline) => {
                    try {
                        const newPipeline = await Pipeline.create({
                            pipeline_name: pipeline.pipeline_name,
                            client_id,
                            created_by: username
                        });
                        return newPipeline;
                    } catch (error) {
                        console.error('Error creating pipeline:', {
                            pipeline_name: pipeline.pipeline_name,
                            error: error.message
                        });
                        return null;
                    }
                })
            );

            return createdPipelines.filter(p => p !== null);
        }

        return existingPipelines;
    } catch (error) {
        console.error('Error in seedDefaultPipelines:', error.message);
        throw error;
    }
};

export default {
    validator: validator({
        body: Joi.object({
            pipeline_name: Joi.string().required()
        })
    }),
    handler: async (req, res) => {
        try {
            const { pipeline_name } = req.body;
            const client_id = req.des?.client_id;

            // Check if pipeline already exists for this client
            const existingPipeline = await Pipeline.findOne({
                where: { pipeline_name, client_id }
            });

            if (existingPipeline) {
                return responseHandler.error(res, "Pipeline already exists");
            }

            const pipeline = await Pipeline.create({
                pipeline_name,
                client_id,
                created_by: req.user?.username
            });

            return responseHandler.success(res, "Pipeline created successfully", pipeline);
        } catch (error) {
            return responseHandler.error(res, error?.message);
        }
    }
};