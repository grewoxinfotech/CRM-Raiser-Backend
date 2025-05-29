import Joi from "joi";
import Job from "../../models/jobModel.js";
import responseHandler from "../../utils/responseHandler.js";
import validator from "../../utils/validator.js";

export default {
    validator: validator({
        params: Joi.object({
            id: Joi.string().required()
        })
    }),
    handler: async (req, res) => {
        try {
            const { id } = req.params;
            const job = await Job.findOne({ where: { id } });
            if (!job) {
                return responseHandler.error(res, "Job not found");
            }
            await job.destroy();
            return responseHandler.success(res, "Job deleted successfully", job);
        } catch (error) {
            return responseHandler.error(res, error?.message);
        }
    }
}
