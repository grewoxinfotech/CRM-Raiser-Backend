import Joi from "joi";
import Leave from "../../models/leaveModel.js";
import validator from "../../utils/validator.js";
import responseHandler from "../../utils/responseHandler.js";

export default {
    validator: validator({
        params: Joi.object({
            id: Joi.string().required()
        }),
        body: Joi.object({
            status: Joi.string().valid('pending', 'approved', 'rejected').default('pending'),
            remarks: Joi.string().optional()
        })
    }),
    handler: async (req, res) => {
        try {
            const { id } = req.params;
            const { status, remarks } = req.body;

            const leave = await Leave.findByPk(id);
            if (!leave) {
                return responseHandler.notFound(res, "Leave record not found");
            }

            await leave.update({
                status,
                remarks,
                updated_by: req.user?.username
            });

            return responseHandler.success(res, "Leave updated successfully", leave);
        } catch (error) {

            return responseHandler.error(res, error?.message);
        }
    }
};
