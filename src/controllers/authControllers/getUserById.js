import Joi from "joi";
import User from "../../models/userModel.js";
import validator from "../../utils/validator.js";
import responseHandler from "../../utils/responseHandler.js";

export default {
    validator: validator({
        params: Joi.object({
            id: Joi.string().required()
        })
    }),
    handler: async (req, res) => {
        try {
            const { id } = req.params;

            const user = await User.findByPk(id);

            if (!user) {
                return responseHandler.notFound(res, "User not found");
            }

            return responseHandler.success(res, "User fetched successfully", foundUser);
        } catch (error) {

            return responseHandler.error(res, error?.message);
        }
    }
};