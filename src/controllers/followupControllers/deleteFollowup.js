import Joi from "joi";
import validator from "../../utils/validator.js";
import Followup from "../../models/followupModel.js";
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

            const followup = await Followup.findByPk(id);
            if (!followup) {
                return responseHandler.error(res, "Followup not found");
            }

            await followup.destroy();

            return responseHandler.success(res, "Followup deleted successfully", followup);
        } catch (error) {
            return responseHandler.error(res, error?.message);
        }
    }
}
