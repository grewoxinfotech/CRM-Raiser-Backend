import Joi from "joi";
import responseHandler from "../../utils/responseHandler.js";
import validator from "../../utils/validator.js";
import Designation from "../../models/designationModel.js";
import { Op } from "sequelize";

export default {
    validator: validator({
        params: Joi.object({
            id: Joi.string().required()
        }),
        body: Joi.object({
            branch: Joi.string().required(),
            // department: Joi.string().required(),
            designation_name: Joi.string().required(),
        })
    }),
    handler: async (req, res) => {
        try {
            const { id } = req.params;
            const { designation_name, branch } = req.body;
            const designation = await Designation.findByPk(id);

            if (!designation) {
                return responseHandler.error(res, "Designation not found");
            }

            const existingDesignation = await Designation.findOne({
                where: { designation_name, branch, updated_by: req.user?.username, id: { [Op.not]: id } }
            });

            if (existingDesignation) {
                return responseHandler.error(res, "Designation name already exists for the given branch");
            }

            await designation.update({ designation_name, branch, updated_by: req.user?.username });
            return responseHandler.success(res, "Designation updated successfully", designation);
        } catch (error) {
            return responseHandler.error(res, error?.message);
        }
    }
}