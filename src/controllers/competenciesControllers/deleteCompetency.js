import Joi from "joi";
import validator from "../../utils/validator.js";
import Competency from "../../models/competencyModel.js";
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
            const competency = await Competency.findByPk(id);
            if (!competency) {
                return responseHandler.error(res, "Competency not found");
            }
            await competency.destroy();
            return responseHandler.success(res, "Competency deleted successfully", competency);
        } catch (error) {
            return responseHandler.error(res, error?.message);
        }
    }
}