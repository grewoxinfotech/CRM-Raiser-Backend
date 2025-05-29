import Joi from "joi";
import TransferAccount from "../../models/transferacconutModel.js";
import responseHandler from "../../utils/responseHandler.js";
import validator from "../../utils/validator.js";

export default {
    validator: validator({
        params: Joi.object({
            id: Joi.string().required()
        })
    }),
    handler: async (req, res) => {
        try {
            const { id } = req.params;
            const account = await TransferAccount.findByPk(id);
            if (!account) {
                return responseHandler.error(res, "Transfer account not found");
            }
            await account.destroy();
            return responseHandler.success(res, "Transfer account deleted successfully", account);
        } catch (error) {
            return responseHandler.error(res, error?.message);
        }
    }
}
