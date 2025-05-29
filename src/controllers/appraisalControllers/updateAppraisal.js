import Joi from "joi";
import Appraisal from "../../models/AppraisalModel.js";
import responseHandler from "../../utils/responseHandler.js";
import validator from "../../utils/validator.js";
import { Op } from "sequelize";

export default {
    validator: validator({
        params: Joi.object({
            id: Joi.string().required()
        }),
        body: Joi.object({
            employee: Joi.string().optional(),
            branch: Joi.string().optional(),
           
            businessProcess: Joi.number().optional(),
            oralCommunication: Joi.number().optional(),
            leadership: Joi.number().optional(),
            projectManagement: Joi.number().optional(),
            allocatingResources: Joi.number().optional(),
            overallRating: Joi.number().optional(),
        })
    }),
    handler: async (req, res) => {
        try {
            const { id } = req.params;
            const { employee, branch, businessProcess, oralCommunication, leadership, projectManagement, allocatingResources, overallRating } = req.body;
            const appraisal = await Appraisal.findByPk(id);
            if (!appraisal) {
                return responseHandler.error(res, "Appraisal not found");
            }
            const existingAppraisal = await Appraisal.findOne({
                where: {
                    employee,
                    id: {
                        [Op.not]: id
                    }   
                }
            });
            if (existingAppraisal && employee !== appraisal.employee) {
                return responseHandler.error(res, "Appraisal already exists for the given employee");
            }
            await appraisal.update({ employee, branch,  businessProcess, oralCommunication, leadership, projectManagement, allocatingResources, overallRating, updated_by: req.user?.username });
            return responseHandler.success(res, "Appraisal updated successfully", appraisal);
        } catch (error) {
            return responseHandler.error(res, error?.message);
        }
    }
}