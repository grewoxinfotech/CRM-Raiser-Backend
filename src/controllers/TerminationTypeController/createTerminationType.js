import Joi from "joi";
import TerminationType from "../../models/TerminationTypeModel.js";
import responseHandler from "../../utils/responseHandler.js";
import validator from "../../utils/validator.js";

export default {
    validator: validator({
        body: Joi.object({
            name: Joi.string().required(),
        })
    }),
    handler: async (req, res) => {
        try {
            const { name } = req.body;
            const existingTerminationType = await TerminationType.findOne({ where: { name } });
            if (existingTerminationType) {
                return responseHandler.error(res, "Termination type already exists");
            }
            const terminationtype = await TerminationType.create({ name, created_by: req.user?.username });
            if (!terminationtype) {
                return responseHandler.error(res, "Failed to create Termination type");
            }
            return responseHandler.success(res, "Termination type created successfully", terminationtype);
        } catch (error) {
            return responseHandler.error(res, error?.message);
        }
    }
}