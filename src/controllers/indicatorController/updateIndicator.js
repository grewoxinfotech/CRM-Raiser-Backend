import Joi from "joi";
import Indicator from "../../models/IndicatorModel.js";
import responseHandler from "../../utils/responseHandler.js";
import validator from "../../utils/validator.js";
import { Op } from "sequelize";

export default {
    validator: validator({
        params: Joi.object({
            id: Joi.string().required()
        }),
        body: Joi.object({
            branch: Joi.string().optional(),
            department: Joi.string().optional(),
            designation: Joi.string().optional(),
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
            const { branch, department, designation, businessProcess, oralCommunication, leadership, projectManagement, allocatingResources, overallRating } = req.body;
            const indicator = await Indicator.findByPk(id);
            if (!indicator) {
                return responseHandler.error(res, "Indicator not found");
            }
            // const existingIndicator = await Indicator.findOne({
            //     where: {
            //         employee,
            //         id: {
            //             [Op.not]: id
            //         }
            //     }
            // });
            // if (existingIndicator && employee !== indicator.employee) {
            //     return responseHandler.error(res, "Indicator already exists for the given employee");
            // }
            await indicator.update({ branch, department, designation, businessProcess, oralCommunication, leadership, projectManagement, allocatingResources, overallRating, updated_by: req.user?.username });
            return responseHandler.success(res, "Indicator updated successfully", indicator);
        } catch (error) {
            return responseHandler.error(res, error?.message);
        }
    }
}