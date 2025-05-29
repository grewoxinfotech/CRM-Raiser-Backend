import Joi from "joi";
import AwardType from "../../models/AwardTypeModel.js";
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
            const existingAwardType = await AwardType.findOne({ where: { name } });
            if (existingAwardType) {
                return responseHandler.error(res, "Award type already exists");
            }
            const awardtype = await AwardType.create({ name, 
                created_by: req.user?.username });
            if (!awardtype) {
                return responseHandler.error(res, "Failed to create Award type");
            }
            return responseHandler.success(res, "Award type created successfully", awardtype);
        } catch (error) {
            return responseHandler.error(res, error?.message);
        }
    }
}