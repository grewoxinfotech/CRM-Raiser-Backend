import Joi from "joi";
import JobStages from "../../models/JobStagesModel.js";
import responseHandler from "../../utils/responseHandler.js";
import validator from "../../utils/validator.js";


export default {
    validator: validator({
        body: Joi.object({
            title: Joi.string().required(),
        })
    }),
    handler: async (req, res) => {
        try {
            const { title } = req.body;
            const existingJobStages = await JobStages.findOne({ where: { title } });
            if (existingJobStages) {
                return responseHandler.error(res, "Job stages already exists");
            }
            const jobStages = await JobStages.create({ title,
                client_id: req.des?.client_id,
                created_by: req.user?.username });
            return responseHandler.success(res, "Job stages created successfully", jobStages);
        } catch (error) {
            return responseHandler.error(res, error?.message);
        }
    }
}