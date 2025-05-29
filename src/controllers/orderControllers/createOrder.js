import Joi from "joi";
import validator from "../../utils/validator.js";
import responseHandler from "../../utils/responseHandler.js";
import Order from "../../models/orderModel.js";

export default {
    validator: validator({
        params: Joi.object({
            id: Joi.string().required()
        }),
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
            const { id } = req.params;
            const { client, billing_address, shipping_address, project, genratedBy, status, items, discount, tax, total, client_Note } = req.body;
            const existingOrder = await Order.findOne({ where: { related_id: id, client, billing_address, shipping_address, project, genratedBy, status, items, discount, tax, total, client_Note } });
            if (existingOrder) {
                return responseHandler.error(res, "Order already exists");
            }
            const order = await Order.create({ related_id: id, client, billing_address, shipping_address, project, genratedBy, status, items, discount, tax, total, client_Note,
                client_id: req.des?.client_id,
                created_by: req.user?.username, });
            return responseHandler.success(res, "Order created successfully", order);
        } catch (error) {
            return responseHandler.error(res, error?.message);
        }
    }
}