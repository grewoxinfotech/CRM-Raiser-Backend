import Joi from "joi";
import Payment from "../../models/paymentModel.js";
import validator from "../../utils/validator.js";
import responseHandler from "../../utils/responseHandler.js";
import uploadToS3 from "../../utils/uploadToS3.js";
import { s3 } from "../../config/config.js";
import { Op } from "sequelize";

export default {
    validator: validator({
        params: Joi.object({
            id: Joi.string().required()
        }),
        body: Joi.object({
            project: Joi.string().optional().allow('', null),
            invoice: Joi.string().optional().allow('', null),
            paidOn: Joi.date().optional().allow('', null),
            amount: Joi.number().optional().allow('', null),
            currency: Joi.string().optional().allow('', null),
            transactionId: Joi.string().optional().allow('', null),
            paymentMethod: Joi.string().optional().allow('', null),
            remark: Joi.string().optional().allow('', null),
            status: Joi.string().optional().allow('', null)
        })
    }),
    handler: async (req, res) => {
        try {
            const { id } = req.params;
        
            const { project, invoice, paidOn, amount, currency, transactionId, paymentMethod, remark, status } = req.body;

            const payment = await Payment.findByPk(id);
            if (!payment) {
                return responseHandler.notFound(res, "Payment not found");
            }
            const existingPayment = await Payment.findOne({ where: { related_id: payment.related_id, invoice, id: { [Op.not]: payment.id } } });
            if (existingPayment) {
                return responseHandler.error(res, "Payment already exists");
            }
           
            await payment.update({
                project,
                invoice,
                paidOn,
                amount,
                currency,
                transactionId,
                status,
                paymentMethod,
                remark,
                updated_by: req.user?.username
            });

            return responseHandler.success(res, "Payment updated successfully", payment);
        } catch (error) {
            return responseHandler.error(res, error?.message);
        }
    }
};
