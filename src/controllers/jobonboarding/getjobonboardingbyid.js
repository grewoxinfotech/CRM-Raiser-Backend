import Joi from "joi";
import validator from "../../utils/validator.js";
import responseHandler from "../../utils/responseHandler.js";
import JobOnboarding from "../../models/jobonboarding.js";

export default {
    validator: validator({
        params: Joi.object({
            id: Joi.string().required()
        })
    }),
    handler: async (req, res) => {
        try {
            const { id } = req.params;

            const jobOnboarding = await JobOnboarding.findByPk(id);

            if (!jobOnboarding) {
                return responseHandler.error(res, "Job onboarding record not found");
            }

            return responseHandler.success(res, "Job onboarding record fetched successfully", jobOnboarding);
        } catch (error) {
            return responseHandler.error(res, error?.message);
        }
    }
}
