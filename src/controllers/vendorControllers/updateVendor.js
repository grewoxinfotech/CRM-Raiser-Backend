import Joi from "joi";
import Vendor from "../../models/vendorModel.js";
import validator from "../../utils/validator.js";
import responseHandler from "../../utils/responseHandler.js";

export default {
    validator: validator({
        params: Joi.object({
            id: Joi.string().required()
        }),
        body: Joi.object({
            name: Joi.string().required(),
            contact: Joi.string().required(),
            phonecode: Joi.string().optional().allow("", null),
            email: Joi.string().email().optional().allow("", null), 
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
            const { id } = req.params;
            const { name, contact, phonecode, email, taxNumber, address, city, state, country, zipcode } = req.body;

            const existingVendor = await Vendor.findByPk(id);
            if (!existingVendor) {
                return responseHandler.error(res, "Vendor not found");
            }   

            await Vendor.update(
                {
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
                    updated_by: req.user?.username
                },
                {
                    where: { id }
                }
            );
            
            const updatedVendor = await Vendor.findByPk(id);
            
            return responseHandler.success(res, "Vendor updated successfully", updatedVendor);
        } catch (error) {
            return responseHandler.error(res, error.message);
        }
    }
}
