import Joi from "joi";
import InterviewSchedule from "../../models/interviewSchedule.js";
import responseHandler from "../../utils/responseHandler.js";
import validator from "../../utils/validator.js";

export default {
    validator: validator({
        params: Joi.object({
            id: Joi.string().required()
        })
    }),
    handler: async (req, res) => {
        try {
            const { id } = req.params;
            const interviewSchedule = await InterviewSchedule.findByPk(id);
            await interviewSchedule.destroy();
            return responseHandler.success(res, "Interview schedule deleted successfully", interviewSchedule);
        } catch (error) {
            return responseHandler.error(res, error?.message);
        }
    }
}
