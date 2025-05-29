import Joi from "joi";
import validator from "../../utils/validator.js";
import CompanyInquiry from "../../models/companyInquiryModel.js";
import responseHandler from "../../utils/responseHandler.js";

export default {
    validator: validator({
        body: Joi.object({
            fullname: Joi.string().required(),
            business_category: Joi.string().required(),
            phone: Joi.string().required(),
            description: Joi.string().required()
        })
    }),
    handler: async (req, res) => {
        try {
            const { fullname, business_category, phone, description } = req.body;
            const companyInquiry = await CompanyInquiry.create({
                fullname,
                business_category,
                phone,
                description,
                client_id: req.des?.client_id,
                created_by: req.user?.username
            });
            return responseHandler.success(res, "Company inquiry created successfully", companyInquiry);
        } catch (error) {
            return responseHandler.error(res, error?.message);
        }
    }
}
