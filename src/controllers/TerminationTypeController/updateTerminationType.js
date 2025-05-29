import Joi from "joi";
import TerminationType from "../../models/TerminationTypeModel.js";
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
            const terminationTypeToUpdate = await TerminationType.findByPk(id);
            if (!terminationTypeToUpdate) {
                return responseHandler.error(res, "Termination type not found");
            }
            const existingTerminationType = await TerminationType.findOne({ where: { name, id: { [Op.not]: id } } });
            if (existingTerminationType) {
                return responseHandler.error(res, "Termination type already exists");
            }
            await terminationTypeToUpdate.update({ name, updated_by: req.user?.username });
            return responseHandler.success(res, "Termination type updated successfully", terminationTypeToUpdate);
        } catch (error) {
            return responseHandler.error(res, error?.message);
        }
    }
}