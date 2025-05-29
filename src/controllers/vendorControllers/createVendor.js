import Joi from "joi";
import Vendor from "../../models/vendorModel.js";
import validator from "../../utils/validator.js";
import responseHandler from "../../utils/responseHandler.js";

export default {
    validator: validator({
        body: Joi.object({
            name: Joi.string().required(),
            contact: Joi.string().required(),
            phonecode: Joi.string().optional().allow("", null),
            email: Joi.string().email().optional(), 
            taxNumber: Joi.string().optional().allow("", null),
            address: Joi.string().optional().allow("", null),
            city: Joi.string().optional().allow("", null),
            state: Joi.string().optional().allow("", null),
            country: Joi.string().optional().allow("", null),
            zipcode: Joi.string().optional().allow("", null)
        })
    }),
    handler: async (req, res) => {
        try {
            const { name, contact, phonecode, email, taxNumber, address, city, state, country, zipcode } = req.body
            // const existi`ngVendor = await Vendor.findOne({ where: { email } });
            // if (existingVendor) {
            //     return responseHandler.error(res, "Vendor already exists");
            // }`
            const vendor = await Vendor.create({
                name,
                contact,
                phonecode,
                email,
                taxNumber,
                address,
                city,
                state, 
                country,
                zipcode,
                client_id: req.des?.client_id,
                created_by: req.user?.username
            })
            return responseHandler.success(res, "Vendor created successfully", vendor)
        } catch (error) {
            return responseHandler.error(res, error.message)
        }
    }
}
