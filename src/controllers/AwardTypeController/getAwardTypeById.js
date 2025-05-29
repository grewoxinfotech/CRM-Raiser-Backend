import Joi from "joi";
import AwardType from "../../models/AwardTypeModel.js";
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
            const awardType = await AwardType.findByPk(id);
            if (!awardType) {
                return responseHandler.error(res, "Award type not found");
            }
            return responseHandler.success(res, "Award fetched successfully", awardType);
        } catch (error) {
            return responseHandler.error(res, error?.message);
        }
    }
}