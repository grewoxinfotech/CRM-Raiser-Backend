import Joi from "joi";
import TraingingType from "../../models/TraingingTypeModel.js";
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
            const traingingType = await TraingingType.findByPk(id);
            if (!traingingType) {
                return responseHandler.error(res, "Trainging type not found");
            }
            return responseHandler.success(res, "Trainging fetched successfully", traingingType);
        } catch (error) {
            return responseHandler.error(res, error?.message);
        }
    }
}