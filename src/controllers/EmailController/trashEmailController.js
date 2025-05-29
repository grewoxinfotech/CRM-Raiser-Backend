import Email from "../../models/emailModel.js";
import responseHandler from "../../utils/responseHandler.js";
import validator from "../../utils/validator.js";
import Joi from "joi";

export default {
  validator: validator({
    params: Joi.object({
      id: Joi.string().required(),
    }),
  }),

  handler: async (req, res) => {
    try {
      const { id } = req.params;
      const email = await Email.findOne({ where: { id } });

      if (!email) {
        return responseHandler.error(res, "Email not found");
      }

      let updateData = {};

      if (email.type !== "trash" && !email.isTrash) {
        // First time moving to trash
        updateData = {
          isTrash: true,
          type: "trash",
          updated_by: req.user?.username,
        };
      } else if (email.type === "trash" && email.isTrash) {
        // Restoring from trash
        updateData = {
          isTrash: false,
          type: "sent",
          updated_by: req.user?.username,
        };
      }

      await email.update(updateData);

      const message = updateData.isTrash
        ? "Email moved to trash"
        : "Email restored from trash";
      return responseHandler.success(res, message, email);
    } catch (error) {
      return responseHandler.error(res, error?.message);
    }
  },
};
