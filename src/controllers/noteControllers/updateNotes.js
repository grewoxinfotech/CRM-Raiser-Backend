import Joi from "joi";
import Note from "../../models/noteModel.js";
import Activity from "../../models/activityModel.js";
import responseHandler from "../../utils/responseHandler.js";
import validator from "../../utils/validator.js";
import { Op } from "sequelize";

export default {
    validator: validator({
        params: Joi.object({
            id: Joi.string().required(),
        }),
        body: Joi.object({
            note_title: Joi.string().optional().allow('', null),
            notetype: Joi.string().optional().allow('', null),
            employees: Joi.object().optional().allow('', null),
            description: Joi.string().optional().allow('', null),
        })
    }),
    handler: async (req, res) => {
        try {
            const { id } = req.params;
            const { note_title, notetype, employees, description } = req.body;
            const note = await Note.findByPk(id);
            if (!note) {
                return responseHandler.error(res, "Note not found");
            }
            const existingNote = await Note.findOne({ where: { note_title,  related_id: note.related_id, id: { [Op.not]: id } } });
            if (existingNote) {
                return responseHandler.error(res, "Note already exists");
            }
            await note.update({ note_title, notetype, employees, description, updated_by: req.user?.username });
            
            await Activity.create({
                related_id: note.related_id,
                activity_from: "note",
                activity_id: note.id,
                action: "updated",
                performed_by: req.user?.username,
                activity_message: `Note ${note.note_title} updated successfully`
            });
            return responseHandler.success(res, "Note updated successfully", note);
        } catch (error) {
            return responseHandler.error(res, error?.message);
        }
    }
}