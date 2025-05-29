import Joi from "joi";
import validator from "../../utils/validator.js";
import responseHandler from "../../utils/responseHandler.js";
import Announcement from "../../models/announcementModel.js";
import Notification from "../../models/notificationModel.js";
import dayjs from "dayjs";

export default {
    validator: validator({
        params: Joi.object({
            id: Joi.string().required()
        })
    }),
    handler: async (req, res) => {
        const { id } = req.params;
        try {
            const announcement = await Announcement.findByPk(id);
            if (!announcement) {
                return responseHandler.error(res, "Announcement not found");
            }

            // Delete all related notifications
            await Notification.destroy({
                where: {
                    related_id: announcement.id,
                    section: "announcement"
                }
            });

            // Delete the announcement
            await announcement.destroy();

            return responseHandler.success(res, "Announcement deleted successfully", announcement);
        } catch (error) {
            return responseHandler.error(res, error?.message);
        }
    }
}   