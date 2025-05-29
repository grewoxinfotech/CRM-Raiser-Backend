import Joi from "joi";
import TraingingType from "../../models/TraingingTypeModel.js";
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
            const traingingTypeToUpdate = await TraingingType.findByPk(id);
            if (!traingingTypeToUpdate) {
                return responseHandler.error(res, "Trainging type not found");
            }
            const existingTraingingType = await TraingingType.findOne({ where: { name, id: { [Op.not]: id } } });
            if (existingTraingingType) {
                return responseHandler.error(res, "Trainging type already exists");
            }
            await traingingTypeToUpdate.update({ name, updated_by: req.user?.username });
            return responseHandler.success(res, "Trainging type updated successfully", traingingTypeToUpdate);
        } catch (error) {
            return responseHandler.error(res, error?.message);
        }
    }
}