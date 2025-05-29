import Joi from "joi";
import validator from "../../utils/validator.js";
import Message from "../../models/messageModel.js";
import responseHandler from "../../utils/responseHandler.js";
import { Op } from "sequelize";
import uploadToS3 from "../../utils/uploadToS3.js";
import { s3 } from "../../config/config.js";

export default {
    validator: validator({
        params: Joi.object({
            id: Joi.string().required()
        }),
        body: Joi.object({
            chooseMember: Joi.string().required(),
            message: Joi.string().required(),
            isRead: Joi.boolean().optional()
        })
    }),
    handler: async (req, res) => {
        try {
            const file = req.file;
            const { id } = req.params;
            const { chooseMember, message, isRead } = req.body;
            const messageData = await Message.findByPk(id);
            const existingMessage = await Message.findOne({ where: { chooseMember, message, isRead, id: { [Op.not]: id } } });
            if (existingMessage) {
                return responseHandler.error(res, "Message already exists");
            }
            if (!messageData) {
                return responseHandler.error(res, "Message not found");
            }
            let fileUrl = messageData.file;
            if (file) {
                if (messageData.file) {
                    const key = decodeURIComponent(messageData.file.split(".com/").pop());
                    const s3Params = {
                        Bucket: s3.config.bucketName,
                        Key: key,
                    };
                    await s3.deleteObject(s3Params).promise();
                }
                fileUrl = await uploadToS3(file, "client", "messages", req.user?.username);
            }
            await messageData.update({ chooseMember, message, isRead, file: fileUrl });

            return responseHandler.success(res, "Message updated successfully", messageData);
        }
        catch (error) {
            return responseHandler.error(res, error?.message);
        }
    }
}