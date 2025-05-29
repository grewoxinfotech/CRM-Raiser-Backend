import Joi from "joi";
import Appraisal from "../../models/AppraisalModel.js";
import responseHandler from "../../utils/responseHandler.js";
import validator from "../../utils/validator.js";

export default {
    validator: validator({
        body: Joi.object({
            employee: Joi.string().required(),
            branch: Joi.string().required(),
            businessProcess: Joi.number().required(),
            oralCommunication: Joi.number().required(),
            leadership: Joi.number().required(),
            projectManagement: Joi.number().required(),
            allocatingResources: Joi.number().required(),
            overallRating: Joi.number().required(),
        })
    }),
    handler: async (req, res) => {
        try {
            const { employee, branch, businessProcess, oralCommunication, leadership, projectManagement, allocatingResources, overallRating } = req.body;
            
            const existingAppraisal = await Appraisal.findOne({
                where: { employee }
            });
            if (existingAppraisal) {
                return responseHandler.error(res, "Appraisal already exists for the given employee");
            }
            const appraisal = await Appraisal.create({ employee, branch, businessProcess, oralCommunication, leadership, projectManagement, allocatingResources, overallRating,
                client_id: req.des?.client_id,
                created_by: req.user?.username });
            responseHandler.success(res, "Appraisal created successfully", appraisal);
        } catch (error) {
            responseHandler.error(res, error?.message);
        }
    }
}