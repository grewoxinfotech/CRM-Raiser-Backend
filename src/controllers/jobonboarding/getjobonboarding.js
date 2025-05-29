import responseHandler from "../../utils/responseHandler.js";
import JobOnboarding from "../../models/jobonboarding.js";
import Joi from "joi";
import validator from "../../utils/validator.js";

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
            const { rows: data, count } = await JobOnboarding.findAndCountAll(req.queryOptions);

            return responseHandler.success(res, {
                data: data.map(d => ({ ...d.toJSON(), key: d.id })),
                pagination: {
                    total: count,
                    ...req.pagination,
                    totalPages: Math.ceil(count / req.pagination.pageSize)
                }
            });
        } catch (error) {
            console.error('Error in getjobonboarding:', error);
            return responseHandler.error(res, error?.message);
        }
    }
}
