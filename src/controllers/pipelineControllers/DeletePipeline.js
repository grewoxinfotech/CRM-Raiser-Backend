import Joi from "joi";
import Pipeline from "../../models/pipelineModel.js";
import responseHandler from "../../utils/responseHandler.js";
import validator from "../../utils/validator.js";
import Stage from "../../models/stageModel.js";

export default {
    validator: validator({
        params: Joi.object({
            id: Joi.string().required()
        })
    }),
    handler: async (req, res) => {
        try {
            const { id } = req.params;
            const client_id = req.des?.client_id;

            // Find pipeline and verify it belongs to the client
            const pipeline = await Pipeline.findOne({
                where: {
                    id,
                    client_id
                }
            });

            if (!pipeline) {
                return responseHandler.notFound(res, "Pipeline not found");
            }

            // Delete associated stages first
            await Stage.destroy({
                where: {
                    pipeline: id,
                    client_id
                }
            });

            // Delete the pipeline
            await pipeline.destroy();
            return responseHandler.success(res, 'Pipeline deleted successfully', pipeline);
        } catch (error) {
            return responseHandler.error(res, error?.message);
        }
    }
};