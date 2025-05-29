import Joi from "joi";
import Customer from "../../models/customersModel.js";
import responseHandler from "../../utils/responseHandler.js";
import validator from "../../utils/validator.js";

export default {
  validator: validator({
    body: Joi.object({
      customerNumber: Joi.string().optional().allow("", null),
      name: Joi.string().required(),
      contact: Joi.string().required(),
      phonecode: Joi.string().optional().allow("", null),
      email: Joi.string().email().allow("", null).optional(),
      tax_number: Joi.string().optional().allow("", null),
      alternate_number: Joi.string().allow("", null),
      billing_address: Joi.any().optional().allow(null),
      shipping_address: Joi.any().optional().allow(null),
    }),
  }),
  handler: async (req, res) => {
    try {
      const {
        customerNumber,
        name,
        contact,
        email,
        tax_number,
        alternate_number,
        billing_address,
        shipping_address,
        phonecode,
      } = req.body;

      const existingCustomer = await Customer.findOne({ where: { contact } });
      if (existingCustomer) {
        return responseHandler.error(res, "Customer already exists");
      }

      const customer = await Customer.create({
        related_id: req.user?.id,
        name,
        contact,
        customerNumber,
        phonecode,
        email,
        tax_number,
        alternate_number,
        billing_address,
        shipping_address,
        client_id: req.des?.client_id,
        created_by: req.user?.username,
      });

      return responseHandler.success(
        res,
        "Customer created successfully",
        customer
      );
    } catch (error) {
      return responseHandler.error(res, error?.message);
    }
  },
};
