import Joi from "joi";
import Contract from "../../models/contractModel.js";
import responseHandler from "../../utils/responseHandler.js";
import validator from "../../utils/validator.js";

export default {
    validator: validator({
        body: Joi.object({
            subject: Joi.string().required(),
            project: Joi.string().required(),
            description: Joi.string().required(),
            client: Joi.string().required(),
            type: Joi.string().required(),
            value: Joi.number().required(),
            startDate: Joi.date().required(),
            endDate: Joi.date().required(),
            type: Joi.string().required(),
            currency: Joi.string().required(),
            client: Joi.string().required(),
            phone: Joi.string().required(),
            city: Joi.string().required(),
            state: Joi.string().required(),
            country: Joi.string().required(),
            zipcode: Joi.number().required(),
            address: Joi.string().required(),
            notes: Joi.string().required(),
        })
    }),
    handler: async (req, res) => {
        try {
            const { subject, client, project, type, value, startDate, endDate, currency, description,
                phone, address, city, state, country, zipcode, notes } = req.body;
            const existingContract = await Contract.findOne({ where: { subject } });
            if (existingContract) {
                return responseHandler.error(res, "Contract already exists");
            }
            const contract = await Contract.create({
                subject, client, project, type, value, startDate, endDate, currency, description,
                phone, address, city, state, country, zipcode, notes, created_by: req.user?.username,
                client_id: req.des?.client_id
            });
            return responseHandler.success(res, "Contract created successfully", contract);
        } catch (error) {
            return responseHandler.error(res, error?.message);
        }
    }

}
