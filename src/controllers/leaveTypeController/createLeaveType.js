import Joi from "joi";
import LeaveType from "../../models/leaveTypeModel.js";
import responseHandler from "../../utils/responseHandler.js";
import validator from "../../utils/validator.js";

export default {
    validator: validator({
        body: Joi.object({
            leaveType: Joi.string().required(),
            daysPerYear: Joi.number().required()
        })
    }),
    handler: async (req, res) => {
        try {
            const { leaveType, daysPerYear } = req.body;
            const existingLeaveType = await LeaveType.findOne({ where: { leaveType } });
            if (existingLeaveType) {
                return responseHandler.error(res, "Leave type already exists");
            }
            const leavetype = await LeaveType.create({ leaveType, daysPerYear,
                client_id: req.des?.client_id,
                created_by: req.user?.username });
            if (!leavetype) {
                return responseHandler.error(res, "Failed to create leave type");
            }
            return responseHandler.success(res, "Leave type created successfully", leavetype);
        } catch (error) {
            return responseHandler.error(res, error?.message);
        }
    }
}