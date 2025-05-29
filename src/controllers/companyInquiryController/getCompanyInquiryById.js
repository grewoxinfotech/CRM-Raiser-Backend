import Joi from "joi";
import validator from "../../utils/validator.js";
import CompanyInquiry from "../../models/companyInquiryModel.js";
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
            const companyInquiry = await CompanyInquiry.findByPk(id);

            if (!companyInquiry) {
                return responseHandler.error(res, "Company inquiry not found", 404);
            }

            return responseHandler.success(res, "Company inquiry retrieved successfully", companyInquiry);
        } catch (error) {
            return responseHandler.error(res, error?.message);
        }
    }
}
