import Note from "../../models/noteModel.js";
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
            const notes = await Note.findAll({ where: { related_id: id } });
            return responseHandler.success(res, "Notes fetched successfully", notes);
        } catch (error) {
            return responseHandler.error(res, error?.message);
        }
    }
}