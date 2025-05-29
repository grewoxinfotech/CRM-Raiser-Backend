import Joi from "joi";
import Note from "../../models/noteModel.js";
import Activity from "../../models/activityModel.js";
import responseHandler from "../../utils/responseHandler.js";
import validator from "../../utils/validator.js";

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

            const existingNote = await Note.findOne({ where: { note_title, related_id: id } });
            if (existingNote) {
                return responseHandler.error(res, "Note already exists");
            }
            const note = await Note.create({ related_id: id, note_title, notetype, employees, description,
                client_id: req.des?.client_id,
                created_by: req.user?.username });

            await Activity.create({
                related_id: id,
                activity_from: "note",
                activity_id: note.id,
                action: "created",
                performed_by: req.user?.username,
                client_id: req.des?.client_id,
                activity_message: `Note ${note.note_title} created successfully`
            });
            return responseHandler.success(res, "Note created successfully", note);
        } catch (error) {
            return responseHandler.error(res, error?.message);
        }
    }
}