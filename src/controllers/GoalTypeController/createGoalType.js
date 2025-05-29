import Joi from "joi";
import GoalType from "../../models/GoalTypeModel.js";
import responseHandler from "../../utils/responseHandler.js";
import validator from "../../utils/validator.js";

export default {
    validator: validator({
        body: Joi.object({
            name: Joi.string().required(),
        })
    }),
    handler: async (req, res) => {
        try {
            const { name } = req.body;
            const existingGoalType = await GoalType.findOne({ where: { name } });
            if (existingGoalType) {
                return responseHandler.error(res, "Goal type already exists");
            }
            const goaltype = await GoalType.create({ name, 
                client_id: req.des?.client_id,
                created_by: req.user?.username });
            if (!goaltype) {
                return responseHandler.error(res, "Failed to create Goal type");
            }
            return responseHandler.success(res, "Goal type created successfully", goaltype);
        } catch (error) {
            return responseHandler.error(res, error?.message);
        }
    }
}