import Joi from "joi";
import validator from "../../utils/validator.js";
import Message from "../../models/messageModel.js";
import responseHandler from "../../utils/responseHandler.js";
import uploadToS3 from "../../utils/uploadToS3.js";

export default {
    validator: validator({
        body: Joi.object({
            chooseMember: Joi.string().required(),
            message: Joi.string().required(),
            isRead: Joi.boolean().optional()
        })
    }),
    handler: async (req, res) => {
        try {
            const file = req.file;
            const { chooseMember, message, isRead } = req.body;
            const existingMessage = await Message.findOne({ where: { chooseMember, message, isRead } });
            if (existingMessage) {
                return responseHandler.error(res, "Message already exists");
            }
            const fileUrl = await uploadToS3(file, "client", "messages", req.user?.username);
            const messageData = await Message.create({
                chooseMember,
                message,
                file: fileUrl,
                isRead,
                client_id: req.des?.client_id,
                created_by: req.user?.username
            });
            return responseHandler.success(res, "Message sent successfully", messageData);
        }
        catch (error) {
            return responseHandler.error(res, error?.message);
        }
    }
}