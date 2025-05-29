import Joi from "joi";
import Tag from "../../models/labelModel.js";
import validator from "../../utils/validator.js";
import responseHandler from "../../utils/responseHandler.js";
import User from "../../models/userModel.js";
import { Op } from "sequelize";

export default {
    validator: validator({
        params: Joi.object({
            id: Joi.string().required()
        }),
        query: Joi.object({
            page: Joi.number(),
            limit: Joi.number()
        })
    }),
    handler: async (req, res) => {
        try {
            const { id } = req.params;
            const user = await User.findOne({
                where: { id: req.user.id }
            });

            const tags = await Tag.findAll({
                where: {
                    related_id: id,
                    [Op.or]: [{ client_id: user.client_id }, { client_id: user.id }]
                }
            });

            return responseHandler.success(res, "labels retrieved successfully", tags);
        } catch (error) {
            return responseHandler.error(res, error?.message);
        }
    }
};

