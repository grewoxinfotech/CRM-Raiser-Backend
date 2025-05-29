import Joi from "joi";
import Attendance from "../../models/attendanceModel.js";
import validator from "../../utils/validator.js";
import responseHandler from "../../utils/responseHandler.js";

export default {
    validator: validator({
        body: Joi.object({
            attendances: Joi.object().pattern(
                Joi.string(),
                Joi.object({
                    employee: Joi.string().required(),
                    date: Joi.date().required(),
                    startTime: Joi.string().required(),
                    endTime: Joi.string().required(),
                    late: Joi.string().optional().allow('', null),
                    halfDay: Joi.boolean().optional().allow('', null),
                })
            ).optional().allow(null),
        }),
    }),
    handler: async (req, res) => {
        try {
            const attendanceRecords = Object.keys(req.body.attendances).map(key => ({
                ...req.body.attendances[key],
                created_by: req.user?.username,
            }));
            const attendances = await Attendance.bulkCreate(attendanceRecords);

            return responseHandler.created(res, "Bulk attendance marked successfully", {
                totalRecords: attendances.length,
                attendances
            });

        } catch (error) {

            return responseHandler.error(res, error.message);
        }
    }
};