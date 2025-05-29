import Joi from "joi";
import Holiday from "../../models/holidayModel.js";
import Notification from "../../models/notificationModel.js";
import responseHandler from "../../utils/responseHandler.js";
import validator from "../../utils/validator.js";

export default {
  validator: validator({
    params: Joi.object({
      id: Joi.string().required(),
    }),
  }),
  handler: async (req, res) => {
    try {
      const { id } = req.params;
      const holiday = await Holiday.findByPk(id);
      if (!holiday) {
        return responseHandler.success(res, "Holiday not found");
      }

      // Delete all associated notifications first
      await Notification.destroy({
        where: {
          related_id: id,
          section: "holiday",
        },
        force: true,
      });

      await holiday.destroy();
      return responseHandler.success(
        res,
        "Holiday and associated notifications deleted successfully",
        holiday
      );
    } catch (error) {
      console.error("Error deleting holiday:", error);
      return responseHandler.error(
        res,
        "Failed to delete holiday and associated notifications"
      );
    }
  },
};
