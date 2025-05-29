import Joi from "joi";
import validator from "../../utils/validator.js";
import Message from "../../models/messageModel.js";
import responseHandler from "../../utils/responseHandler.js";

export default {
    validator: validator({
        params: Joi.object({
            id: Joi.string().required()
        })
    }),
    handler: async (req, res) => {
        try {
            const { id } = req.params;
            const message = await Message.findByPk(id);
            if (!message) {
                return responseHandler(res, "Message not found");
            }
            return responseHandler.success(res, "Message fetched successfully", message);
        }
        catch (error) {
            return responseHandler.error(res, "Internal server error");
        }
    }
}