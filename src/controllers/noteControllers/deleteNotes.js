import Joi from "joi";
import Note from "../../models/noteModel.js";
import responseHandler from "../../utils/responseHandler.js";
import validator from "../../utils/validator.js";
import Activity from "../../models/activityModel.js";

export default {
    validator: validator({
        params: Joi.object({
            id: Joi.string().required(),
        }),
    }),
    handler: async (req, res) => {
        try {
            const { id } = req.params;
            const note = await Note.findByPk(id);
            if (!note) {
                return responseHandler.error(res, "Note not found");
            }
            await note.destroy();
            await Activity.create({
                related_id: note.related_id,
                activity_from: "note",
                activity_id: note.id,
                action: "deleted",
                performed_by: req.user?.username,
                activity_message: `Note ${note.note_title} deleted successfully`
            });
            return responseHandler.success(res, "Note deleted successfully", note);
        } catch (error) {
            return responseHandler.error(res, error?.message);
        }
    }
}