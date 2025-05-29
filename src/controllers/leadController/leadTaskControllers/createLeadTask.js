import Joi from "joi";
import Task from "../../../models/taskModel.js";
import responseHandler from "../../../utils/responseHandler.js";
import validator from "../../../utils/validator.js";
import Lead from "../../../models/leadModel.js";

export default {
    validator: validator({
        params: Joi.object({
            leadId: Joi.string().required()
        }),
        body: Joi.object({
            taskTitle: Joi.string().required(),
            taskStatus: Joi.string().required(),
            taskPriority: Joi.string().required(),
            taskDescription: Joi.string().required().messages({
                'string.empty': 'Lead Task description is required',
                'string.base': 'Lead Task description must be a string'
            }),
            taskDate: Joi.date().required().messages({
                'date.base': 'Lead Task date must be a date'
            })
        })
    }),
    handler: async (req, res) => {
        try {
            const { leadId } = req.params;
            const {
                taskTitle,
                taskStatus,
                taskPriority,
                taskDescription,
                taskDate
            } = req.body;

            const lead = await Lead.findByPk(leadId);
            if (!lead) {
                return responseHandler.notFound(res, "Lead not found");
            }
            const existingTask = await Task.findOne({
                where: {
                    leadId,
                    taskTitle
                }
            });
            if (existingTask) {
                return responseHandler.conflict(res, "Lead task with this title already exists!");
            }

            const task = await Task.create({
                leadId,
                taskTitle,
                taskStatus,
                taskPriority,
                taskDescription,
                taskDate,
                client_id: req.des?.client_id,
                created_by: req.user?.username
            });

            return responseHandler.success(res, "Lead task created successfully", task);
        } catch (error) {
            return responseHandler.error(res, error?.message);
        }
    }
};
