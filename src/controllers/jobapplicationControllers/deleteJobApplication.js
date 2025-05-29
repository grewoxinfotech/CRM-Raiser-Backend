import Joi from "joi";
import validator from "../../utils/validator.js";
import responseHandler from "../../utils/responseHandler.js";
import JobApplication from "../../models/jobapplicationModel.js";
import { s3 } from "../../config/config.js";

export default {
    validator: validator({
        params: Joi.object({
            id: Joi.string().required()
        })
    }),
    handler: async (req, res) => {
        try {
            const { id } = req.params;
            const jobApplication = await JobApplication.findByPk(id);
            if (!jobApplication) {
                return responseHandler.error(res, "Job application not found");
            }

            if (jobApplication.cv_path) {
                const key = decodeURIComponent(jobApplication.cv_path.split(".com/").pop());
                const s3Params = {
                    Bucket: s3.config.bucketName,
                    Key: key,
                };
                await s3.deleteObject(s3Params).promise();
            }

            await jobApplication.destroy();
            return responseHandler.success(res, "Job application deleted successfully", jobApplication);
        } catch (error) {
            return responseHandler.error(res, error?.message);
        }
    }
}