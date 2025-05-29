import Joi from "joi";
import validator from "../../utils/validator.js";
import FollowupMetting from "../../models/followupMettingModel.js";
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
            const followupMetting = await FollowupMetting.findAll({
                where: {
                    related_id: id,
                    client_id: req.des?.client_id
                }
            });

            return responseHandler.success(res, "Followup meetings retrieved successfully", followupMetting);
        } catch (error) {
            return responseHandler.error(res, error?.message);
        }
    }
}
