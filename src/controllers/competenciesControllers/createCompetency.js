import Joi from "joi";
import Competency from "../../models/competencyModel.js";
import responseHandler from "../../utils/responseHandler.js";
import validator from "../../utils/validator.js";

export default {
    validator: validator({
        body: Joi.object({
            name: Joi.string().required(),
            type: Joi.string().required()
        })
    }),
    handler: async (req, res) => {
        try {
            const { name, type } = req.body;
            const existingCompetency = await Competency.findOne({ where: { name } });
            if (existingCompetency) {
                return responseHandler.error(res, "Competency already exists");
            }
            const competency = await Competency.create({ name, type, created_by: req.user?.username });
            if (!competency) {
                return responseHandler.error("competency not found")
            }
            return responseHandler.success(res, "competency created successfully", competency);
        } catch (error) {
            return responseHandler.error(res, error?.message);
        }
    }
}