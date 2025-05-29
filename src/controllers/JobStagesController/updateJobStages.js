import Joi from "joi";
import JobStages from "../../models/JobStagesModel.js";
import responseHandler from "../../utils/responseHandler.js";
import validator from "../../utils/validator.js";
import { Op } from "sequelize";


export default {
    validator: validator({
        params: Joi.object({
            id: Joi.string().required()
        }),
        body: Joi.object({
            title: Joi.string().required(),
        })
    }),
    handler: async (req, res) => {
        try {
            const { id } = req.params;
            const { title } = req.body;
            const jobStagesToUpdate = await JobStages.findByPk(id);
            if (!jobStagesToUpdate) {
                return responseHandler.error(res, "Job category not found");
            }
            const existingJobStages = await JobStages.findOne({ where: { title, id: { [Op.not]: id } } });
            if (existingJobStages) {
                return responseHandler.error(res, "Job category already exists");
            }
            await jobStagesToUpdate.update({ title, created_by: req.user?.username });
            return responseHandler.success(res, "Job category updated successfully", jobStagesToUpdate);
        } catch (error) {
            return responseHandler.error(res, error?.message);
        }
    }
}