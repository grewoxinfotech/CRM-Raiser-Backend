import Joi from "joi";
import LeaveType from "../../models/leaveTypeModel.js";
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
            const leaveType = await LeaveType.findByPk(id);
            if (!leaveType) {
                return responseHandler.error(res, "Leave type not found");
            }
            await leaveType.destroy();
            return responseHandler.success(res, "Leave deleted successfully", leaveType);
        } catch (error) {
            return responseHandler.error(res, error?.message);
        }
    }
}