import Joi from "joi";
import Leave from "../../models/leaveModel.js";
import validator from "../../utils/validator.js";
import responseHandler from "../../utils/responseHandler.js";
import { Op } from "sequelize";

export default {
  validator: validator({
    params: Joi.object({
      id: Joi.string().optional(),
    }),
    body: Joi.object({
      employeeId: Joi.string().optional(),
      startDate: Joi.date().optional(),
      endDate: Joi.date().optional(),
      leaveType: Joi.string()
        .valid("sick", "casual", "annual", "other")
        .optional(),
      reason: Joi.string().optional(),
      isHalfDay: Joi.boolean().optional(),
    }),
  }),
  handler: async (req, res) => {
    try {
      const { id } = req.params;
      const { employeeId, startDate, endDate, leaveType, reason, isHalfDay } =
        req.body;

      const leave = await Leave.findByPk(id);
      if (!leave) {
        return responseHandler.notFound(res, "Leave record not found");
      }

      const existingLeave = await Leave.findOne({
        where: {
          employeeId,
          startDate: {
            [Op.between]: [startDate, endDate],
          },
          id: { [Op.not]: id },
        },
      });

      if (existingLeave) {
        return responseHandler.conflict(
          res,
          "Leave already exists for the given date range"
        );
      }

      await leave.update({
        employeeId,
        startDate,
        endDate,
        leaveType,
        reason,
        isHalfDay,
        updated_by: req.user?.username,
      });

      return responseHandler.success(res, "Leave updated successfully", leave);
    } catch (error) {
      return responseHandler.error(res, error?.message);
    }
  },
};
