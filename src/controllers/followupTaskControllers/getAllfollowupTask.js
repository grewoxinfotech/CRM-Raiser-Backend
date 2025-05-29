import Joi from "joi";
import validator from "../../utils/validator.js";
import FollowupTask from "../../models/followupTaskModel.js";
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
            const followupTasks = await FollowupTask.findAll({
                where: {
                    related_id: id,
                    // client_id: req.des?.client_id
                }
            });

            return responseHandler.success(res, "Followup tasks retrieved successfully", followupTasks);
        } catch (error) {
            return responseHandler.error(res, error?.message);
        }
    }
}
