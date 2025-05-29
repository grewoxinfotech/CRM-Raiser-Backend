import Joi from "joi";
import Tax from "../../models/taxModel.js";
import validator from "../../utils/validator.js";
import responseHandler from "../../utils/responseHandler.js";

export default {
    validator: validator({
        body: Joi.object({
            gstName: Joi.string().required(),
            gstPercentage: Joi.string().required(),
            // gstRate: Joi.number().required()
        })
    }),
    handler: async (req, res) => {
        try {
            const { gstName, gstPercentage } = req.body;

            const existingGst = await Tax.findOne({ where: { gstName, gstPercentage } });
            if (existingGst) {
                return responseHandler.error(res, "Tax already exists");
            }

            const tax = await Tax.create({
                gstName,
                gstPercentage,
                client_id: req.des?.client_id,
                created_by: req.user?.username
            });

            return responseHandler.success(res, "Tax created successfully", tax);
        } catch (error) {
            return responseHandler.error(res, error);
        }
    }
};
