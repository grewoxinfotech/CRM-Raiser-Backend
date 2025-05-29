import Joi from "joi";
import validator from "../../utils/validator.js";
import CompanyInquiry from "../../models/companyInquiryModel.js";
import responseHandler from "../../utils/responseHandler.js";

export default {
    validator: validator({
        params: Joi.object({
            id: Joi.string().required()
        }),
        body: Joi.object({
            fullname: Joi.string().required(),
            business_category: Joi.string().required(),
            phone: Joi.string().required(),
            description: Joi.string().required()
        })
    }),
    handler: async (req, res) => {
        try {
            const { id } = req.params;
            const { fullname, business_category, phone, description } = req.body;

            const companyInquiry = await CompanyInquiry.findByPk(id);

            if (!companyInquiry) {
                return responseHandler.error(res, "Company inquiry not found");
            }

            await companyInquiry.update({
                fullname,
                business_category,
                phone,
                description,
                updated_by: req.user?.username
            });

            return responseHandler.success(res, "Company inquiry updated successfully", companyInquiry);
        } catch (error) {
            return responseHandler.error(res, error?.message);
        }
    }
}