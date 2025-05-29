import Joi from "joi";
import Competency from "../../models/competencyModel.js";
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
            type: Joi.string().required()
        })
    }),
    handler: async (req, res) => {
        try {
            const { id } = req.params;
            const { name, type } = req.body;
            const competencyToUpdate = await Competency.findByPk(id);
            if (!competencyToUpdate) {
                return responseHandler.error(res, "Competency not found");
            }
            const existingCompetency = await Competency.findOne({ where: { name, id: { [Op.not]: id } } });
            if (existingCompetency) {
                return responseHandler.error(res, "Competency already exists");
            }
            await competencyToUpdate.update({ name, type, updated_by: req.user?.username });
            return responseHandler.success(res, "Competency updated successfully", competencyToUpdate);
        } catch (error) {
            return responseHandler.error(res, error?.message);
        }
    }
}