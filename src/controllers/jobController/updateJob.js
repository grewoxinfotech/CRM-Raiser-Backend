import Joi from "joi";
import validator from "../../utils/validator.js";
import Job from "../../models/jobModel.js";
import responseHandler from "../../utils/responseHandler.js";
import { Op } from "sequelize";

export default {
    validator: validator({
        params: Joi.object({
            id: Joi.string().required()
        }),
        body: Joi.object({
            title: Joi.string().required(),
            category: Joi.string().required(),
            skills: Joi.object().required(),
            location: Joi.string().required(),
            interviewRounds: Joi.object().required(),
            totalOpenings: Joi.number().optional(),
            startDate: Joi.date().required(),
            endDate: Joi.date().required(),
            status: Joi.string().required(),
            recruiter: Joi.string().required(),
            jobType: Joi.string().required(),
            workExperience: Joi.string().required(),
            currency: Joi.string().required(),
            expectedSalary: Joi.string().required(),
            description: Joi.string().optional().allow('', null),
        })
    }),
    handler: async (req, res) => {
        try {
            const { title, category, skills, location, interviewRounds, startDate, endDate, totalOpenings, status, recruiter, jobType, workExperience, currency, expectedSalary, description } = req.body;
            const { id } = req.params;
            const job = await Job.findByPk(id);
            if (!job) {
                return responseHandler.error(res, "Job not found");
            }
            const existingJob = await Job.findOne({ where: { title, id: { [Op.not]: id } } });
            if (existingJob) {
                return responseHandler.error(res, "Job already exists");
            }
            await job.update({ title, category, skills, location, interviewRounds, startDate, endDate, totalOpenings, status, recruiter, jobType, workExperience, currency, expectedSalary, description, updated_by: req.user?.username });
            return responseHandler.success(res, "Job updated successfully", job);
        } catch (error) {
            return responseHandler.error(res, error?.message);
        }
    }
}