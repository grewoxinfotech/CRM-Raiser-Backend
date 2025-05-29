import Joi from "joi";
import validator from "../../utils/validator.js";
import Followup from "../../models/followupModel.js";
import responseHandler from "../../utils/responseHandler.js";
import { Op } from "sequelize";

export default {
    validator: validator({
        params: Joi.object({
            id: Joi.string().required()
        }),
        body: Joi.object({
            name: Joi.string().required(),
            type: Joi.string().required(),
            followup_by: Joi.string().required(),
            date: Joi.date().required(),
            time: Joi.string().required(),
            description: Joi.string().allow(null, ''),
            status: Joi.string().required()
        })
    }),

    handler: async (req, res) => {
        try {
            const { id } = req.params;
            const { name, type, followup_by, date, time, description, status } = req.body;

            const followup = await Followup.findByPk(id);
            if (!followup) {
                return responseHandler.error(res, "Followup not found");
            }

            const existingFollowup = await Followup.findOne({
                where: {
                    name,
                    id: { [Op.not]: id }
                }
            });
            if (existingFollowup) {
                return responseHandler.error(res, "Followup with this name already exists");
            }

            await followup.update({
                name,
                type,
                followup_by,
                date,
                time,
                description,
                status,
                updated_by: req.user.username
            });

            return responseHandler.success(res, "Followup updated successfully", followup);
        } catch (error) {
            return responseHandler.error(res, error?.message);
        }
    }
}
