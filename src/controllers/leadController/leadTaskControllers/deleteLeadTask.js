import responseHandler from "../../../utils/responseHandler.js";
import validator from "../../../utils/validator.js";
import Task from "../../../models/taskModel.js";
import Joi from "joi";
export default {
    validator: validator({
        params: Joi.object({
            leadId: Joi.string().required(),
            taskId: Joi.string().required()
        })
    }),
    handler: async (req, res) => {
        const { leadId, taskId } = req.params;
        try {
            const leadTask = await Task.findOne({
                where: {
                    id: taskId,
                    leadId: leadId
                }
            });

            if (!leadTask) {
                return responseHandler.notFound(res, "Lead task not found");
            }

            await leadTask.destroy();
            return responseHandler.success(res, "Lead task deleted successfully");
        } catch (error) {
            return responseHandler.error(res, error?.message);
        }
    }
}