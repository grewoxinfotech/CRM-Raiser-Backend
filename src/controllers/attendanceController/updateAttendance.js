import Joi from "joi";
import Attendance from "../../models/attendanceModel.js";
import validator from "../../utils/validator.js";
import responseHandler from "../../utils/responseHandler.js";
import { Op } from "sequelize";

export default {
    validator: validator({
        params: Joi.object({
            id: Joi.string().required()
        }),
        body: Joi.object({
            employee: Joi.string().optional().allow('', null),
            date: Joi.date().optional().allow('', null),
            startTime: Joi.string().optional().allow('', null),
            endTime: Joi.string().optional().allow('', null),
            late: Joi.string().optional().allow('', null),
            halfDay: Joi.string().optional().allow('', null),
            comment: Joi.string().optional().allow('', null)
        })
    }),
    handler: async (req, res) => {
        try {
            const { id } = req.params;
            const { employee, date, startTime, endTime, late, halfDay, comment } = req.body;

            // Find attendance by either attendance ID or employee ID
            const attendance = await Attendance.findOne({
                where: {
                    [Op.or]: [
                        { id },
                        { employee }
                    ],
                    date
                }
            });

            if (!attendance) {
                return responseHandler.notFound(res, "Attendance record not found");
            }

            // Check if another attendance record exists for the same employee and date
            const existingAttendance = await Attendance.findOne({
                where: {
                    employee,
                    date,
                    id: { [Op.not]: attendance.id }
                }
            });

            if (existingAttendance) {
                return responseHandler.error(res, "Attendance already exists for this employee on the given date");
            }

            await attendance.update({
                employee,
                date,
                startTime,
                endTime,
                late,
                halfDay,
                comment,
                updated_by: req.user?.username
            });

            return responseHandler.success(res, "Attendance updated successfully", attendance);
        } catch (error) {
            return responseHandler.error(res, error?.message);
        }
    }
};