import Joi from "joi";
import validator from "../../utils/validator.js";
import responseHandler from "../../utils/responseHandler.js";
import Order from "../../models/orderModel.js";
import { Op } from "sequelize";

export default {
    validator: validator({
        body: Joi.object({
            client: Joi.string().required(),
            billing_address: Joi.string().required(),
            shipping_address: Joi.string().required(),
            project: Joi.string().required(),
            genratedBy: Joi.string().required(),
            status: Joi.string().required(),
            items: Joi.object().required(),
            discount: Joi.number().required(),
            tax: Joi.number().optional(),
            total: Joi.number().required(),
            client_Note: Joi.string().optional(),
        })
    }),
    handler: async (req, res) => {
        try {
            const { client, billing_address, shipping_address, project, genratedBy, status, items, discount, tax, total, client_Note } = req.body;
            const order = await Order.findByPk(req.params.id);
            if (!order) {
                return responseHandler.error(res, "Order not found");
            }
            const existingOrder = await Order.findOne({ where: { related_id: order.related_id, client, billing_address, shipping_address, project, genratedBy, status, items, discount, tax, total, client_Note, id: { [Op.not]: order.id } } });
            if (existingOrder) {
                return responseHandler.error(res, "Order already exists");
            }
            order.update({ client, billing_address, shipping_address, project, genratedBy, status, items, discount, tax, total, client_Note, updated_by: req.user?.username, });
            return responseHandler.success(res, "Order updated successfully", order);
        } catch (error) {
            return responseHandler.error(res, error?.message);
        }
    }
}