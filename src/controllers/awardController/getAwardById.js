import Joi from "joi";
import Award from "../../models/awardModel.js";
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
            const award = await Award.findByPk(id);
            if (!award) {
                return responseHandler.error(res, "Award not found");
            }
            return responseHandler.success(res, award);
        } catch (error) {
            return responseHandler.error(res, error?.message);
        }
    }
}

