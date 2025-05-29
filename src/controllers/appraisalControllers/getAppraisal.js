import Joi from "joi";
import Appraisal from "../../models/AppraisalModel.js";
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
            const appraisal = await Appraisal.findByPk(id);
            if (!appraisal) {
                return responseHandler.error(res, "Appraisal not found");
            }
            return responseHandler.success(res, "Appraisal fetched successfully", appraisal);
        } catch (error) {
            return responseHandler.error(res, error?.message);
        }
    }
}