import Joi from "joi";
import User from "../../models/userModel.js";
import responseHandler from "../../utils/responseHandler.js";
import validator from "../../utils/validator.js";
import { Op } from "sequelize";

export default {
    validator: validator({
        query: Joi.object({
            page: Joi.number().default(1),
            pageSize: Joi.number().default(10),
            search: Joi.string().allow('').optional()
        })
    }),
    handler: async (req, res) => {
        try {
            const user = await User.findOne({
                where: { id: req.user.id }
            });

            const { rows: data, count } = await User.findAndCountAll({
                ...req.queryOptions,
                where: {
                    [Op.or]: [{ client_id: user.client_id }, { client_id: user.id }],
                    employeeId: {
                        [Op.not]: null
                    }
                }
            });

            return responseHandler.success(res, {
                data: data.map(d => ({ ...d.toJSON(), key: d.id })),
                pagination: {
                    total: count,
                    ...req.pagination,
                    totalPages: Math.ceil(count / req.pagination.pageSize)
                }
            });
        } catch (error) {
            console.error('Error in getAllEmployees:', error);
            return responseHandler.error(res, error?.message);
        }
    }
};
