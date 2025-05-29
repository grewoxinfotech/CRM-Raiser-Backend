import Joi from "joi";
import SalesRevenue from "../../models/salesRevenueModel.js";
import validator from "../../utils/validator.js";
import responseHandler from "../../utils/responseHandler.js";
import { Op } from "sequelize";

export default {
  validator: validator({
    params: Joi.object({
      id: Joi.string().required(),
    }),
    body: Joi.object({
      date: Joi.date().required(),
      currency: Joi.string().optional(),
      amount: Joi.number().required(),
      account: Joi.string().required(),
      customer: Joi.string().required(),
      description: Joi.string().optional().allow("", null),
      category: Joi.string().required(),
    }),
  }),
  handler: async (req, res) => {
    try {
      const { id } = req.params;
      const {
        date,
        currency,
        amount,
        account,
        customer,
        description,
        category,
      } = req.body;
      const salesRevenue = await SalesRevenue.findByPk(id);
      if (!salesRevenue) {
        return responseHandler.error(res, "SalesRevenue not found");
      }
      const existingSalesRevenue = await SalesRevenue.findOne({
        where: {
          related_id: id,
          date,
          currency,
          amount,
          account,
          customer,
          description,
          category,
          id: { [Op.not]: id },
        },
      });
      if (existingSalesRevenue) {
        return responseHandler.error(res, "SalesRevenue already exists");
      }
      await salesRevenue.update({
        date,
        currency,
        amount,
        account,
        customer,
        description,
        category,
        updated_by: req.user?.username,
      });
      return responseHandler.success(
        res,
        "SalesRevenue updated successfully",
        salesRevenue
      );
    } catch (error) {
      return responseHandler.error(res, error?.message);
    }
  },
};
