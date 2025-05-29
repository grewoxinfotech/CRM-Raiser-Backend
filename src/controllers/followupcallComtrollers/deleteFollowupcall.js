import FollowupCall from "../../models/followupCallModel.js";
import responseHandler from "../../utils/responseHandler.js";
import Joi from "joi";
import validator from "../../utils/validator.js";
import Notification from "../../models/notificationModel.js";

export default {
  validator: validator({
    params: Joi.object({
      id: Joi.string().required(),
    }),
  }),

  handler: async (req, res) => {
    try {
      const { id } = req.params;

      const followupCall = await FollowupCall.findByPk(id);
      if (!followupCall) {
        return responseHandler.error(res, "Followup call not found");
      }

      // Delete all notifications related to this call
      await Notification.destroy({
        where: { related_id: id },
      });

      // Delete the call
      await FollowupCall.destroy({
        where: { id },
      });

      return responseHandler.success(res, "Followup call deleted successfully");
    } catch (error) {
      return responseHandler.error(res, error?.message);
    }
  },
};
