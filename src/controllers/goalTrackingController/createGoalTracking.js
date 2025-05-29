import Joi from "joi";
import validator from "../../utils/validator.js";
import GoalTracking from "../../models/goalTrackingModel.js";
import responseHandler from "../../utils/responseHandler.js";

export default {
    validator: validator({
        body: Joi.object({
            branch: Joi.string().required(),
            goalType: Joi.string().required(),
            startDate: Joi.date().required(),
            endDate: Joi.date().required(),
            status: Joi.string().required(),
            target_achievement: Joi.string().required(),
            rating: Joi.string().required(),
            description: Joi.string().required(),
        })
    }),

    handler: async (req, res) => {
        try {
            const { branch, goalType, startDate, endDate, status, target_achievement, description, rating } = req.body;
            const existingGoalTracking = await GoalTracking.findOne({ where: { branch, goalType, startDate, endDate } });
            if (existingGoalTracking) {
                return responseHandler.error(res, "Goal Tracking already exists");
            }
            const goalTracking = await GoalTracking.create({ branch, goalType, startDate, endDate, status, target_achievement, description, rating, 
                client_id: req.des?.client_id,
                created_by: req.user?.username });
            return responseHandler.success(res, "Goal Tracking created successfully", goalTracking);
        } catch (error) {
            return responseHandler.error(res, error?.message);
        }
    }
}