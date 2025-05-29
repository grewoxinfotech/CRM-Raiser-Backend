import Joi from "joi";
import Note from "../../models/noteModel.js";
import Activity from "../../models/activityModel.js";
import responseHandler from "../../utils/responseHandler.js";
import validator from "../../utils/validator.js";
import { Op } from "sequelize";
import Notification from "../../models/notificationModel.js";

export default {
    validator: validator({
        params: Joi.object({
            id: Joi.string().required(),
        }),
        body: Joi.object({
            read: Joi.boolean().required(),
        })
    }),
    handler: async (req, res) => {
        try {
            const { id } = req.params;
            const { read } = req.body;
            const notification = await Notification.findByPk(id);
            if (!notification) {
                return responseHandler.error(res, "Notification not found");
            }
           
            await notification.update({ read, updated_by: req.user?.username });
                        
            return responseHandler.success(res, "Notification updated successfully", notification);
        } catch (error) {
            return responseHandler.error(res, error?.message);
        }
    }
}