import Contract from "../../models/contractModel.js";
import responseHandler from "../../utils/responseHandler.js";
import validator from "../../utils/validator.js";
import Joi from "joi";

export default {
    validator: validator({
        query: Joi.object({
            page: Joi.number().optional(),
            limit: Joi.number().optional()
        })
    }),
    handler: async (req, res) => {
        try {
            const { id } = req.params;
            const contract = await Contract.findByPk(id);
            if (!contract) {
                return responseHandler.error(res, "Contract not found");
            }
            await contract.destroy();
            return responseHandler.success(res, "Contract deleted successfully", contract);
        } catch (error) {
            return responseHandler.error(res, error?.message);
        }
    }
}