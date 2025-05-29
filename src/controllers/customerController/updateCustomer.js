import Joi from "joi";
import Customer from "../../models/customersModel.js";
import responseHandler from "../../utils/responseHandler.js";
import validator from "../../utils/validator.js";
import { Op } from "sequelize";

export default {
  validator: validator({
    params: Joi.object({
      id: Joi.string().required(),
    }),
    body: Joi.object({
      name: Joi.string().required(),
      contact: Joi.string().required(),
      phonecode: Joi.string().required(),
      email: Joi.string().email().required(),
      tax_number: Joi.string().optional().allow("", null),
      alternate_contact: Joi.string().optional().allow("", null),
      billing_address: Joi.any().optional().allow(null),
      shipping_address: Joi.any().optional().allow(null),
    }),
  }),
  handler: async (req, res) => {
    try {
      const { id } = req.params;
      const {
        name,
        contact,
        email,
        tax_number,
        alternate_contact,
        billing_address,
        shipping_address,
        phonecode,
      } = req.body;
      const customer = await Customer.findByPk(id);
      if (!customer) {
        return responseHandler.error(res, "Customer not found");
      }

      const existingCustomer = await Customer.findOne({
        where: { email, id: { [Op.not]: id } },
      });
      if (existingCustomer) {
        return responseHandler.error(res, "Customer already exists");
      }

      await customer.update({
        name,
        contact,
        email,
        tax_number,
        alternate_contact,
        billing_address,
        shipping_address,
        phonecode,
        updated_by: req.user?.username,
      });
      return responseHandler.success(
        res,
        "Customer updated successfully",
        customer
      );
    } catch (error) {
      return responseHandler.error(res, error?.message);
    }
  },
};
