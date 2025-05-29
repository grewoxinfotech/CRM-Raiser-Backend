import Joi from "joi";
import TraingingType from "../../models/TraingingTypeModel.js";
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
            const existingTraingingType = await TraingingType.findOne({ where: { name } });
            if (existingTraingingType) {
                return responseHandler.error(res, "Trainging type already exists");
            }
            const traingingtype = await TraingingType.create({ name, created_by: req.user?.username });
            if (!traingingtype) {
                return responseHandler.error(res, "Failed to create Trainging type");
            }
            return responseHandler.success(res, "Trainging type created successfully", traingingtype);
        } catch (error) {
            return responseHandler.error(res, error?.message);
        }
    }
}