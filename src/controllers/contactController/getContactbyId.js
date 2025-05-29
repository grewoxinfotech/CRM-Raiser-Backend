import Company from "../../models/contactModel.js";
import responseHandler from "../../utils/responseHandler.js";
import Joi from "joi";
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
            const company = await Company.findOne({
                where: {
                    id,
                    client_id: req.des?.client_id
                }
            });

            if (!company) {
                return responseHandler.notFound(res, "Company not found");
            }

            return responseHandler.success(res, "Company fetched successfully", company);
        } catch (error) {
            return responseHandler.error(res, error?.message);
        }
    }
}; 