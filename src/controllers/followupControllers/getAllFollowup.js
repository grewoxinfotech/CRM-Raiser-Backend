import Joi from "joi";
import validator from "../../utils/validator.js";
import Followup from "../../models/followupModel.js";
import responseHandler from "../../utils/responseHandler.js";

export default {
    validator: validator({
        params: Joi.object({
            id: Joi.string().required()
        })
    }),

    handler: async (req, res) => {
        try {
            const { id } = req.params;

            const followups = await Followup.findAll({
                where: {
                    related_id: id,
                    client_id: req.des?.client_id
                }
            });

            return responseHandler.success(res, "Followups retrieved successfully", followups);
        } catch (error) {
            return responseHandler.error(res, error?.message);
        }
    }
}
