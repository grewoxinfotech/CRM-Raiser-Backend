import Joi from "joi";
import validator from "../../utils/validator.js";
import Tax from "../../models/taxModel.js";
import responseHandler from "../../utils/responseHandler.js";
import { Op } from "sequelize";

export default {
    validator: validator({
        params: Joi.object({
            id: Joi.string().required()
        }),
    }),
    body: Joi.object({
        gstName: Joi.string().required(),
        gstPercentage: Joi.string().required()
    }),

    handler: async (req, res) => {
        try {
            const { id } = req.params;
            const { gstName, gstPercentage } = req.body;
            const tax = await Tax.findByPk(id);
            if (!tax) {
                return responseHandler.notFound(res, "Tax not found");
            }
            const existingTax = await Tax.findOne({ where: { gstName, id: { [Op.not]: id } } });
            if (existingTax) {
                return responseHandler.error(res, "Tax already exists");
            }
            await tax.update({ gstName, gstPercentage, updated_by: req.user?.username });
            return responseHandler.success(res, "Tax updated successfully", tax);
        } catch (error) {
            return responseHandler.error(res, error?.message);
        }
    }
}   
