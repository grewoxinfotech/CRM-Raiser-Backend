import Joi from "joi";
import validator from "../../utils/validator.js";
import Country from "../../models/countriesModel.js";
import responseHandler from "../../utils/responseHandler.js";
import { Op } from "sequelize";

export default {
    validator: validator({
        params: Joi.object({
            id: Joi.string().required()
        }),
    }),
    body: Joi.object({
        countryName: Joi.string().required(),
        countryCode: Joi.string().required(),
        phoneCode: Joi.string().required()
    }),

    handler: async (req, res) => {
        try {
            const { id } = req.params;
            const { countryName, countryCode, phoneCode } = req.body;
            const country = await Country.findByPk(id);
            if (!country) {
                return responseHandler.notFound(res, "Country not found");
            }
            const existingCountry = await Country.findOne({ where: { countryName, id: { [Op.not]: id } } });
            if (existingCountry) {
                return responseHandler.error(res, "Country already exists");
            }
            await country.update({ countryName, countryCode, phoneCode, updated_by: req.user?.username });
            return responseHandler.success(res, "Country updated successfully", country);
        } catch (error) {
            return responseHandler.error(res, error?.message);
        }
    }
}   
