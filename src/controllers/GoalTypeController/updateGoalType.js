import Joi from "joi";
import GoalType from "../../models/GoalTypeModel.js";
import responseHandler from "../../utils/responseHandler.js";
import validator from "../../utils/validator.js";
import { Op } from "sequelize";


export default {
    validator: validator({
        params: Joi.object({
            id: Joi.string().required()
        }),
        body: Joi.object({
            name: Joi.string().required(),
        })
    }),
    handler: async (req, res) => {
        try {
            const { id } = req.params;
            const { name } = req.body;
            const goalTypeToUpdate = await GoalType.findByPk(id);
            if (!goalTypeToUpdate) {
                return responseHandler.error(res, "Goal type not found");
            }
            const existingGoalType = await GoalType.findOne({ where: { name, id: { [Op.not]: id } } });
            if (existingGoalType) {
                return responseHandler.error(res, "Goal type already exists");
            }
            await goalTypeToUpdate.update({ name, updated_by: req.user?.username });
            return responseHandler.success(res, "Goal type updated successfully", goalTypeToUpdate);
        } catch (error) {
            return responseHandler.error(res, error?.message);
        }
    }
}