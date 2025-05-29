import Joi from "joi";
import JobCategory from "../../models/JobCategoryModel.js";
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
            const existingJobCategory = await JobCategory.findOne({ where: { title } });
            if (existingJobCategory) {
                return responseHandler.error(res, "Job category already exists");
            }
            const jobCategory = await JobCategory.create({ title,
                client_id: req.des?.client_id,
                created_by: req.user?.username });
            return responseHandler.success(res, "Job category created successfully", jobCategory);
        } catch (error) {
            return responseHandler.error(res, error?.message);
        }
    }
}