import Joi from "joi";
import GoalType from "../../models/GoalTypeModel.js";
import responseHandler from "../../utils/responseHandler.js";
import validator from "../../utils/validator.js";

export default {
    validator: validator({
        params: Joi.object({
            id: Joi.string().required()
        })
    }),
    handler: async (req, res) => {
        try {
            const { id } = req.params;
            const goalType = await GoalType.findByPk(id);
            if (!goalType) {
                return responseHandler.error(res, "Goal type not found");
            }
            return responseHandler.success(res, "Goal fetched successfully", goalType);
        } catch (error) {
            return responseHandler.error(res, error?.message);
        }
    }
}