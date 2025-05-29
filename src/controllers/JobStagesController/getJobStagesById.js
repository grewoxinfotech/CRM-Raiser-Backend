import Joi from "joi";
import JobStages from "../../models/JobStagesModel.js";
import responseHandler from "../../utils/responseHandler.js";
import validator from "../../utils/validator.js";


export default {
    validator: validator({
        params: Joi.object({
            id: Joi.string().required()
        }),
    }),
    handler: async (req, res) => {
        try {
            const { id } = req.params;
            const jobStagesToUpdate = await JobStages.findByPk(id);
            if (!jobStagesToUpdate) {
                return responseHandler.error(res, "Job category not found");
            }
            return responseHandler.success(res, "Job category faetched successfully", jobStagesToUpdate);
        } catch (error) {
            return responseHandler.error(res, error?.message);
        }
    }
}