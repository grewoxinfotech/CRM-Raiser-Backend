import Joi from "joi";
import Task from "../../models/taskModel.js";
import responseHandler from "../../utils/responseHandler.js";
import validator from "../../utils/validator.js";
import { s3 } from "../../config/config.js";
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
      const task = await Task.findByPk(id);
      if (!task) {
        return responseHandler.error(res, "Task not found");
      }

      // Delete associated notification
      await Notification.destroy({
        where: { related_id: id },
      });

      let file = task.file;
      if (file) {
        const key = decodeURIComponent(file.split(".com/").pop());
        const s3Params = {
          Bucket: s3.config.bucketName,
          Key: key,
        };
        await s3.deleteObject(s3Params).promise();
      }

      await task.destroy();
      return responseHandler.success(res, "Task deleted successfully", task);
    } catch (error) {
      return responseHandler.error(res, error?.message);
    }
  },
};
