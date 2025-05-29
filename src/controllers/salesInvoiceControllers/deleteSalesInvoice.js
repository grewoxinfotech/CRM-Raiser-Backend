import Joi from "joi";
import SalesInvoice from "../../models/salesInvoiceModel.js";
import validator from "../../utils/validator.js";
import responseHandler from "../../utils/responseHandler.js";
import Activity from "../../models/activityModel.js";
import Deal from "../../models/dealModel.js";

export default {
    validator: validator({
        params: Joi.object({
            id: Joi.string().required()
        })
    }),
    handler: async (req, res) => {
        try {
            const { id } = req.params;

            // Find the invoice before deletion
            const salesInvoice = await SalesInvoice.findByPk(id);
            if (!salesInvoice) {
                return responseHandler.error(res, "SalesInvoice not found");
            }

            // Store invoice data before deletion for activity log
            const invoiceNumber = salesInvoice.salesInvoiceNumber;
            const invoiceTotal = salesInvoice.total;
            const relatedId = salesInvoice.related_id;

            // If invoice was paid, update the deal value before deletion
            if (salesInvoice.payment_status === 'paid' && relatedId) {
                const deal = await Deal.findOne({
                    where: { id: relatedId }
                });

                if (deal) {
                    const currentValue = deal.value || 0;
                    const newValue = currentValue - invoiceTotal;

                    await deal.update({
                        value: newValue,
                        updated_by: req.user?.username
                    });
                }
            }

            // Delete the invoice
            await salesInvoice.destroy();

            // Create activity log
            await Activity.create({
                related_id: req.user.id,
                activity_from: "sales_invoice",
                activity_id: id,
                action: "deleted",
                performed_by: req.user?.username,
                client_id: req.des?.client_id,
                activity_message: `Sales invoice ${invoiceNumber} deleted`,
            });

            return responseHandler.success(res, "SalesInvoice deleted successfully");
        } catch (error) {
            return responseHandler.error(res, error?.message);
        }
    },
};   