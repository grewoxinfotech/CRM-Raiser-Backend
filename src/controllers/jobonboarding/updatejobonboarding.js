import Joi from "joi";
import validator from "../../utils/validator.js";
import responseHandler from "../../utils/responseHandler.js";
import JobOnboarding from "../../models/jobonboarding.js";
import { Op } from "sequelize";

export default {
    validator: validator({
        params: Joi.object({
            id: Joi.string().required()
        }),
        body: Joi.object({
            Interviewer: Joi.string().required(),
            JoiningDate: Joi.string().required(),
            DaysOfWeek: Joi.string().required(),
            Currency: Joi.string().required(),
            Salary: Joi.string().required(),
            SalaryType: Joi.string().required(),
            SalaryDuration: Joi.string().required(),
            JobType: Joi.string().required(),
            Status: Joi.string().required(),
        })
    }),
    handler: async (req, res) => {
        try {
            const { id } = req.params;
            const { Interviewer, JoiningDate, DaysOfWeek, Currency, Salary,
                SalaryType, SalaryDuration, JobType, Status } = req.body;

            const jobOnboarding = await JobOnboarding.findByPk(id);

            if (!jobOnboarding) {
                return responseHandler.error(res, "Job onboarding record not found");
            }

            const existingJobOnboarding = await JobOnboarding.findOne({
                where: {
                    Interviewer,
                    JoiningDate,
                    Status,
                    id: {
                        [Op.not]: id
                    }
                }
            });
            if (existingJobOnboarding) {
                return responseHandler.error(res, "Job onboarding already exists");
            }
            await jobOnboarding.update({
                Interviewer,
                JoiningDate,
                DaysOfWeek,
                Currency,
                    Salary,
                SalaryType,
                SalaryDuration,
                JobType,
                Status,
                updated_by: req.user?.username
            })
            return responseHandler.success(res, "Job onboarding record updated successfully", jobOnboarding);
        } catch (error) {
            return responseHandler.error(res, error?.message);
        }
    }
}
