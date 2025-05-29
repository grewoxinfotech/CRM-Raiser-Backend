import Joi from "joi";
import validator from "../../utils/validator.js";
import Followup from "../../models/followupModel.js";
import responseHandler from "../../utils/responseHandler.js";

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
            const existingFollowup = await Followup.findOne({ where: { name } });
            if (existingFollowup) {
                return responseHandler.error(res, "Followup already exists");
            }
            const followup = await Followup.create({
                name,
                type,
                followup_by,
                date,
                time,
                description,
                related_id: id,
                status,
                client_id: req.des?.client_id,
                created_by: req.user.username,
            });
            return responseHandler.success(res, "Followup created successfully", followup);
        } catch (error) {
            return responseHandler.error(res, error?.message);
        }
    }
}
