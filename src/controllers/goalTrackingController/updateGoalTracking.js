import Joi from "joi";
import validator from "../../utils/validator.js";
import GoalTracking from "../../models/goalTrackingModel.js";
import responseHandler from "../../utils/responseHandler.js";
import { Op } from "sequelize";

export default {
    validator: validator({
        params: Joi.object({
            id: Joi.string().required()
        }),
        body: Joi.object({
            branch: Joi.string().required(),
            goalType: Joi.string().required(),
            startDate: Joi.date().required(),
            endDate: Joi.date().required(),
            status: Joi.string().required(),
            target_achievement: Joi.string().required(),
            description: Joi.string().required(),
            rating: Joi.string().required(),
            progress: Joi.string().required(),
        })
    }),

    handler: async (req, res) => {
        try {
            const { id } = req.params;
            const { branch, goalType, startDate, endDate, status, target_achievement, description, rating, progress } = req.body;
            const goalTracking = await GoalTracking.findByPk(id);
            if (!goalTracking) {
                return responseHandler.error(res, "Goal Tracking not found");
            }
            const existingGoalTracking = await GoalTracking.findOne({ where: { branch, goalType, startDate, endDate, id: { [Op.not]: id } } });
            if (existingGoalTracking) {
                return responseHandler.error(res, "Goal Tracking already exists");
            }
            await goalTracking.update({ branch, goalType, startDate, endDate, status, target_achievement, description, rating, progress });
            return responseHandler.success(res, "Goal Tracking updated successfully", goalTracking);
        } catch (error) {
            return responseHandler.error(res, error?.message);
        }
    }
}