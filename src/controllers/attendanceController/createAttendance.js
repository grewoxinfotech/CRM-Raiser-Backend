import Joi from "joi";
import Attendance from "../../models/attendanceModel.js";
import validator from "../../utils/validator.js";
import responseHandler from "../../utils/responseHandler.js";

export default {
    validator: validator({
        body: Joi.object({
            employee: Joi.string().required(),
            date: Joi.date().required(),
            startTime: Joi.string().required(),
            endTime: Joi.string().optional().allow("",null),
            late: Joi.string().optional().allow('', null),
            halfDay: Joi.boolean().optional().allow('', null),
        })
    }),
    handler: async (req, res) => {
        try {
            const { employee, date, startTime, endTime, late, halfDay } = req.body;

            const existingAttendance = await Attendance.findOne({ where: { employee, date } });
            if (existingAttendance) {
                return responseHandler.error(res, "Attendance already exists");
            }

            const attendance = await Attendance.create({
                employee,
                date,
                startTime,
                endTime,
                late,
                halfDay,
                client_id: req.des?.client_id,
                created_by: req.user?.username,
            });

            return responseHandler.created(res, "Attendance marked successfully", attendance);
        } catch (error) {
            return responseHandler.error(res, error?.message);
        }
    }
};
