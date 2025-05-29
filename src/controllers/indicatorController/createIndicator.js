import Joi from "joi";
import Indicator from "../../models/IndicatorModel.js";
import responseHandler from "../../utils/responseHandler.js";
import validator from "../../utils/validator.js";

export default {
    validator: validator({
        body: Joi.object({
            branch: Joi.string().required(),
            department: Joi.string().required(),
            designation: Joi.string().required(),
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
            const { branch, department, designation, businessProcess, oralCommunication, leadership, projectManagement, allocatingResources, overallRating } = req.body;
            const existingIndicator = await Indicator.findOne({
                where: { branch, department, designation }
            });
            if (existingIndicator) {
                return responseHandler.error(res, "Indicator already exists for the given branch, department, and designation");
            }
            const indicator = await Indicator.create({ branch, department, designation, businessProcess, oralCommunication, leadership, projectManagement, allocatingResources, overallRating, 
                client_id: req.des?.client_id,
                created_by: req.user?.username });
            responseHandler.success(res, "Indicator created successfully", indicator);
        } catch (error) {
            responseHandler.error(res, error?.message);
        }
    }
}