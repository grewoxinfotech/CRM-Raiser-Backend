import FollowupTask from "../../models/followupTaskModel.js";
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

      const followupTask = await FollowupTask.findByPk(id);
      if (!followupTask) {
        return responseHandler.error(res, "Followup task not found");
      }

      // Delete all notifications related to this task
      await Notification.destroy({
        where: { related_id: id },
      });

      // Delete the task
      await FollowupTask.destroy({
        where: { id },
      });

      return responseHandler.success(res, "Followup task deleted successfully");
    } catch (error) {
      return responseHandler.error(res, error?.message);
    }
  },
};
