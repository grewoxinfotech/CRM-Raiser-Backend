import Joi from "joi";
import validator from "../../utils/validator.js";
import FollowupCall from "../../models/followupCallModel.js";
import responseHandler from "../../utils/responseHandler.js";

export default {

    validator: validator({
        params: Joi.object({
        })
    }),

    handler: async (req, res) => {
        try {
            const followupCall = await FollowupCall.findAll({});

            return responseHandler.success(res, "Followup calls retrieved successfully", followupCall);
        } catch (error) {
            return responseHandler.error(res, error?.message);
        }
    }
}
