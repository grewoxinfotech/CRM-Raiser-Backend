import Joi from "joi";
import Salary from "../../models/SalaryModel.js";
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
            const salary = await Salary.findByPk(id);
            if (!salary) {
                return responseHandler.error(res, "Salary not found");
            }
            await salary.destroy();
            return responseHandler.success(res, "Salary deleted successfully", salary);
        } catch (error) {
            return responseHandler.error(res, error.message);
        }
    }
}