import Joi from "joi";
import responseHandler from "../../utils/responseHandler.js";
import Designation from "../../models/designationModel.js";
import validator from "../../utils/validator.js";
export default {
    validator: validator({
        body: Joi.object({
            branch: Joi.string().required(),
            designation_name: Joi.string().required(),
        }),
    }),
    handler: async (req, res) => {
        
        try {
            const { branch, designation_name } = req.body;
            
            const existingDesignation = await Designation.findOne({
                where: { designation_name, branch }
            });

            if (existingDesignation) {
                return responseHandler.error(res, "Designation name already exists for the given branch and department");
            }

            const designation = await Designation.create({ branch, designation_name,
                 client_id: req.des?.client_id, created_by: req.user?.username });
            return responseHandler.success(res, "Designation created successfully", designation);
        } catch (error) {
            return responseHandler.error(res, error?.message);
        }
    }
}