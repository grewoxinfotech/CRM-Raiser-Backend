import Joi from "joi";
import validator from "../../utils/validator.js";
import TerminationType from "../../models/TerminationTypeModel.js";
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
            const terminationType = await TerminationType.findByPk(id);
            if (!terminationType) {
                return responseHandler.error(res, "Termination type not found");
            }
            await terminationType.destroy();
            return responseHandler.success(res, "Termination type deleted successfully", terminationType);
        } catch (error) {
            return responseHandler.error(res, error?.message);
        }
    }
}