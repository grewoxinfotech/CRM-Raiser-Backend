import Joi from "joi";
import validator from "../../utils/validator.js";
import responseHandler from "../../utils/responseHandler.js";
import JobApplication from "../../models/jobapplicationModel.js";
import uploadToS3 from "../../utils/uploadToS3.js";

export default {
    validator: validator({
        body: Joi.object({
            job: Joi.string().required(),
            name: Joi.string().allow('', null),
            email: Joi.string().allow('', null),
            phoneCode: Joi.string().allow('', null),
            phone: Joi.string().allow('', null),
            location: Joi.string().allow('', null),
            total_experience: Joi.string().allow('', null),
            current_location: Joi.string().allow('', null),
            notice_period: Joi.number().allow('', null),
            status: Joi.string().allow('', null),
            applied_source: Joi.string().allow('', null),
            cv: Joi.string().allow(null),
        })
    }),
    handler: async (req, res) => {
        try {
            const { job, name, email, phoneCode, phone, location, total_experience, current_location, notice_period, status, applied_source } = req.body;

            // Check for existing application

            // Handle CV file upload
            let cvUrl = null;
            if (req.file) {
                try {
                    cvUrl = await uploadToS3(req.file, "client", "job-applications", req.user?.username);
                } catch (uploadError) {
                    console.error('S3 Upload Error:', uploadError);
                    return responseHandler.error(res, "Failed to upload CV file. Please try again later.");
                }
            }

            // Create job application with CV
            const jobApplication = await JobApplication.create({
                job,
                name,
                email,
                phoneCode,
                phone,
                location,
                total_experience,
                current_location,
                notice_period,
                status,
                applied_source,
                cv_path: cvUrl,
                client_id: req.des?.client_id,
                created_by: req.user?.username
            });

            return responseHandler.success(res, "Job application created successfully", jobApplication);
        } catch (error) {
            console.error('Job Application Creation Error:', error);
            return responseHandler.error(res, error?.message || "Failed to create job application");
        }
    }
}

