import Joi from "joi";
import Award from "../../models/awardModel.js";
import responseHandler from "../../utils/responseHandler.js";
import validator from "../../utils/validator.js";

export default {
    validator: validator({
        body: Joi.object({
            employee: Joi.string().required(),
            awardType: Joi.string().required(),
            date: Joi.date().required(),
            gift: Joi.string().required(),
            description: Joi.string().optional().allow("", null),
        })
    }),
    handler: async (req, res) => {
        try {
            const { employee, awardType, date, gift, description } = req.body;
            const existingAward = await Award.findOne({ where: { employee, awardType } });
            if (existingAward) {
                return responseHandler.error(res, "Award already exists");
            }
            const award = await Award.create({ employee, awardType, date, gift, description, created_by: req.user?.username });
            return responseHandler.success(res, award);
        } catch (error) {
            return responseHandler.error(res, error?.message);
        }
    }
}