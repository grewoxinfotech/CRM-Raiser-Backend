import Joi from "joi";
import validator from "../../utils/validator.js";
import Job from "../../models/jobModel.js";
import responseHandler from "../../utils/responseHandler.js";

export default {
    validator: validator({
        body: Joi.object({
            title: Joi.string().required(),
            category: Joi.string().required(),
            skills: Joi.object().required(),
            location: Joi.string().required(),
            interviewRounds: Joi.object().required(),
            startDate: Joi.date().required(),
            endDate: Joi.date().required(),
            totalOpenings: Joi.number().optional(),
            status: Joi.string().required(),
            recruiter: Joi.string().required(),
            jobType: Joi.string().optional(),
            workExperience: Joi.string().optional(),
            currency: Joi.string().required(),
            expectedSalary: Joi.string().required(),
            description: Joi.string().optional().allow('', null),
        })
    }),
    handler: async (req, res) => {
        const { title, category, skills, location, interviewRounds, startDate, endDate, totalOpenings, status, recruiter, jobType, workExperience, currency, expectedSalary, description } = req.body;
        const existingJob = await Job.findOne({ where: { title } });
        if (existingJob) {
            return responseHandler.error(res, "Job already exists");
        }
        const job = await Job.create({ title, category, skills, location, interviewRounds, startDate, endDate, totalOpenings, status, recruiter, jobType, workExperience, currency, expectedSalary, description, 
            client_id: req.des?.client_id,
            created_by: req.user?.username });
        return responseHandler.success(res, "Job created successfully", job);
    }
}




