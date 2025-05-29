import Joi from "joi";
import Leave from "../../models/leaveModel.js";
import validator from "../../utils/validator.js";
import responseHandler from "../../utils/responseHandler.js";

export default {
    validator: validator({
        params: Joi.object({
            id: Joi.string().required()
        })
    }),
    handler: async (req, res) => {
        try {
            const { id } = req.params;

            const leave = await Leave.findByPk(id);
            if (!leave) {
                return responseHandler.notFound(res, "Leave record not found");
            }

            await leave.destroy();

            return responseHandler.success(res, "Leave record deleted successfully", leave);
        } catch (error) {

            return responseHandler.error(res, error?.message);
        }
    }
};
