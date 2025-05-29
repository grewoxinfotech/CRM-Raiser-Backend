import Department from "../../models/departmentModel.js";
import responseHandler from "../../utils/responseHandler.js";
import Joi from "joi";
import validator from "../../utils/validator.js";
import { Op } from "sequelize";

export default {
    validator: validator({
        params: Joi.object({
            id: Joi.string().required()
        }),
        body: Joi.object({
            branch: Joi.string().required(),
            department_name: Joi.string().required(),
        })
    }),
    handler: async (req, res) => {
        try {
            const { id } = req.params;
            const { branch, department_name } = req.body;
            const department = await Department.findByPk(id);
            if (!department) {
                return responseHandler.error(res, "Department not found");
            }
            const existingDepartment = await Department.findOne({
                where: { department_name, branch, id: { [Op.not]: id } }
            });

            if (existingDepartment) {
                return responseHandler.error(res, "Department name already exists in the same branch");
            }
            await department.update({ branch, department_name, updated_by: req.user?.username });
            return responseHandler.success(res, "Department updated successfully", department);
        } catch (error) {
            return responseHandler.error(res, error?.message);
        }
    }
}
