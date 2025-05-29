import Joi from "joi";
import Competency from "../../models/competencyModel.js";
import responseHandler from "../../utils/responseHandler.js";
import validator from "../../utils/validator.js";

export default {
    validator: validator({
        params: Joi.object({
            id: Joi.string().required()
        })
    }),
    handler: async (req, res) => {
        try {
            const { id } = req.params;
            const competency = await Competency.findByPk(id);
            if (!competency) {
                return responseHandler.error(res, "competency type not found");
            }
            return responseHandler.success(res, "competency fetched successfully", competency);
        } catch (error) {
            return responseHandler.error(res, error?.message);
        }
    }
}