import Joi from "joi";
import Skill from "../../models/skillModel.js";
import responseHandler from "../../utils/responseHandler.js";
import validator from "../../utils/validator.js";
import { Op } from "sequelize";
export default {
    validator: validator({
        params: Joi.object({
            id: Joi.string().required()
        }),
        body: Joi.object({
            skillName: Joi.string().required()
        })
    }),
    handler: async (req, res) => {
        try {
            const { id } = req.params;
            const { skillName } = req.body;
            const skill = await Skill.findByPk(id);
            if (!skill) {
                return responseHandler.notFound(res, "Skill not found");
            }
            const existingSkill = await Skill.findOne({ where: { skillName, id: { [Op.not]: id } } });
            if (existingSkill) {
                return responseHandler.error(res, "Skill already exists");
            }
            await skill.update({ skillName, updated_by: req.user?.username });
            return responseHandler.success(res, "Skill updated successfully", skill);
        } catch (error) {
            return responseHandler.error(res, error?.message);
        }
    }
}