import Joi from "joi";
import validator from "../../utils/validator.js";
import responseHandler from "../../utils/responseHandler.js";
import JobOnboarding from "../../models/jobonboarding.js";

export default {
    validator: validator({
        body: Joi.object({
            Interviewer: Joi.string().required(),
            JoiningDate: Joi.string().required(),
            DaysOfWeek: Joi.string().required(),
            Salary: Joi.string().required(),
            Currency: Joi.string().required(),
            SalaryType: Joi.string().required(),
            SalaryDuration: Joi.string().required(),
            JobType: Joi.string().required(),
            Status: Joi.string().required(),
        })
    }),
    handler: async (req, res) => {
        try {
            const { Interviewer, JoiningDate, DaysOfWeek, Salary, Currency, SalaryType, SalaryDuration, JobType, Status } = req.body;

            const existingJobOnboarding = await JobOnboarding.findOne({
                where: {
                    Interviewer,
                    JoiningDate,
                    Status
                }
            });
            if (existingJobOnboarding) {
                return responseHandler.error(res, "Job onboarding already exists");
            }

            const jobOnboarding = await JobOnboarding.create({
                Interviewer,
                JoiningDate,
                DaysOfWeek,
                Salary,
                Currency,
                SalaryType,
                SalaryDuration,
                JobType,
                Status,
                client_id: req.des?.client_id,
                created_by: req.user?.username
            });

            return responseHandler.success(res, "Job onboarding created successfully", jobOnboarding);
        } catch (error) {
            return responseHandler.error(res, error?.message);
        }
    }
}
