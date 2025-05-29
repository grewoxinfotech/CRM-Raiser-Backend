import Joi from "joi";
import TaskCalendar from "../../models/taskcalendarModel.js";
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

      const task = await TaskCalendar.findByPk(id);
      if (!task) {
        return responseHandler.error(res, "Task not found");
      }

      // Delete all associated notifications first
      await Notification.destroy({
        where: {
          related_id: id,
          section: "task_calendar",
        },
        force: true, // Ensure hard delete
      });

      // Delete the task
      await task.destroy();

      return responseHandler.success(
        res,
        "Task and associated notifications deleted successfully",
        task
      );
    } catch (error) {
      console.error("Error deleting task:", error);
      return responseHandler.error(
        res,
        error?.message || "Failed to delete task"
      );
    }
  },
};
