import Joi from "joi";
import AwardType from "../../models/AwardTypeModel.js";
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
            const awardTypeToUpdate = await AwardType.findByPk(id);
            if (!awardTypeToUpdate) {
                return responseHandler.error(res, "Award type not found");
            }
            const existingAwardType = await AwardType.findOne({ where: { name, id: { [Op.not]: id } } });
            if (existingAwardType) {
                return responseHandler.error(res, "Award type already exists");
            }
            await awardTypeToUpdate.update({ name, updated_by: req.user?.username });
            return responseHandler.success(res, "Award type updated successfully", awardTypeToUpdate);
        } catch (error) {
            return responseHandler.error(res, error?.message);
        }
    }
}