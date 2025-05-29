import Joi from "joi";
import JobCategory from "../../models/JobCategoryModel.js";
import responseHandler from "../../utils/responseHandler.js";
import validator from "../../utils/validator.js";


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
            const jobCategoryToUpdate = await JobCategory.findByPk(id);
            if (!jobCategoryToUpdate) {
                return responseHandler.error(res, "Job category not found");
            }
            const existingJobCategory = await JobCategory.findOne({ where: { title, id: { [Op.not]: id } } });
            if (existingJobCategory) {
                return responseHandler.error(res, "Job category already exists");
            }
            await jobCategoryToUpdate.update({ title, created_by: req.user?.username });
            return responseHandler.success(res, "Job category updated successfully", jobCategoryToUpdate);
        } catch (error) {
            return responseHandler.error(res, error?.message);
        }
    }
}