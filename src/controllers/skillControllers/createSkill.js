import Skill from "../../models/skillModel.js";
import responseHandler from "../../utils/responseHandler.js";
import validator from "../../utils/validator.js";
import Joi from "joi";

export default {
    validator: validator({
        body: Joi.object({
            skillName: Joi.string().required(),
        })
    }),
    handler: async (req, res) => {
        try {
            const { skillName } = req.body;
            const existingSkill = await Skill.findOne({ where: { skillName } });
            if (existingSkill) {
                return responseHandler.error(res, "Skill already exists");
            }
            const skill = await Skill.create({ skillName,
                client_id: req.des?.client_id,
                created_by: req.user?.username });
            return responseHandler.success(res, "Skill created successfully", skill);
        } catch (error) {
            return responseHandler.error(res, error?.message);
        }
    }
}