import Joi from "joi";
import JobCategory from "../../models/JobCategoryModel.js";
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
            const jobCategoryToUpdate = await JobCategory.findByPk(id);
            if (!jobCategoryToUpdate) {
                return responseHandler.error(res, "Job category not found");
            }
            await jobCategoryToUpdate.destroy();
            return responseHandler.success(res, "Job category deleted successfully", jobCategoryToUpdate);
        } catch (error) {
            return responseHandler.error(res, error?.message);
        }
    }
}