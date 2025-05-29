import Joi from "joi";
import responseHandler from "../../utils/responseHandler.js";
import validator from "../../utils/validator.js";
import Department from "../../models/departmentModel.js";

export default {
    validator: validator({
        body: Joi.object({
            branch: Joi.string().required(),
            department_name: Joi.string().required(),
        }),
    }),
    handler: async (req, res) => {
        try {
            const { branch, department_name } = req.body;

            const existingDepartment = await Department.findOne({
                where: { department_name, branch }
            });

            if (existingDepartment) {
                return responseHandler.error(res, "Department name already exists in the same branch");
            }

            const department = await Department.create({
                branch,
                department_name,
                client_id: req.des?.client_id,
                created_by: req.user?.username,
            });
            return responseHandler.success(res, "Department created successfully", department);
        } catch (error) {
            return responseHandler.error(res, error?.message);
        }
    }
}