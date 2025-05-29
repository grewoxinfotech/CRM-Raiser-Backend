import Joi from "joi";
import Award from "../../models/awardModel.js";
import responseHandler from "../../utils/responseHandler.js";
import validator from "../../utils/validator.js";
import { Op } from "sequelize";

export default {
    validator: validator({
        params: Joi.object({
            id: Joi.string().required()
        }),
        body: Joi.object({
            employee: Joi.string().optional(),
            awardType: Joi.string().optional(),
            gift: Joi.string().optional(),
            description: Joi.string().optional().allow("", null),
            date: Joi.date().optional(),
        })
    }),
    handler: async (req, res) => {
        try {
            const { id } = req.params;
            const { employee, awardType, gift, description, date } = req.body;
            const award = await Award.findByPk(id);
            if (!award) {
                return responseHandler.error(res, "Award not found");
            }
            const existingAward = await Award.findOne({ where: { employee, awardType, gift, description, date, id: { [Op.ne]: id } } });
            if (existingAward) {
                return responseHandler.error(res, "Award already exists");
            }
            await award.update({ employee, awardType, gift, description, date, updated_by: req.user?.username });
            return responseHandler.success(res, "Award updated successfully");
        } catch (error) {
            return responseHandler.error(res, error?.message);
        }
    }
}

