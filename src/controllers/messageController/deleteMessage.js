import Joi from "joi";
import validator from "../../utils/validator.js";
import Message from "../../models/messageModel.js";
import responseHandler from "../../utils/responseHandler.js";
import { s3 } from "../../config/config.js";

export default {
    validator: validator({
        params: Joi.object({
            id: Joi.string().required()
        })
    }),
    handler: async (req, res) => {
        try {
            const { id } = req.params;
            const messageData = await Message.findByPk(id);
            if (!messageData) {
                return responseHandler.error(res, "Message not found");
            }
            let file = messageData.file;
            if (file) {
                const key = decodeURIComponent(file.split(".com/").pop());
                const s3Params = {
                    Bucket: s3.config.bucketName,
                    Key: key,
                };
                await s3.deleteObject(s3Params).promise();
            }
            await messageData.destroy();
            return responseHandler.success(res, "Message deleted successfully", messageData);
        }
        catch (error) {
            return responseHandler.error(res, "Internal server error");
        }
    }
}   