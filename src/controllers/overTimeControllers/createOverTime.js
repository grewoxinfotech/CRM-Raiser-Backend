import Joi from "joi";
import validator from "../../utils/validator.js";
import OverTime from "../../models/overTimeModel.js";
import responseHandler from "../../utils/responseHandler.js";
import User from "../../models/userModel.js";

export default {
    validator: validator({
        body: Joi.object({
            employeeId: Joi.string().required(),
            title: Joi.string().required(),
            days: Joi.string().required(),
            Hours: Joi.string().required(),
            rate: Joi.string().required(),
        })
    }),
    handler: async (req, res) => {
        try {
            const {employeeId, title, days, Hours, rate } = req.body;
            const existingSalary = await OverTime.findOne({ where: { employeeId } });
            if (existingSalary) {
                return responseHandler.error(res, "Salary already exists");
            }
            const overTime = await OverTime.create({ employeeId, title, days, Hours, rate,
                client_id: req.des?.client_id,
                created_by: req.user?.username });
            return responseHandler.success(res, "OverTime created successfully", overTime);
        } catch (error) {
            return responseHandler.error(res, error?.message);
        }
    }
}


