import Country from "../../models/countriesModel.js";
import responseHandler from "../../utils/responseHandler.js";
import validator from "../../utils/validator.js";
import Joi from "joi";
import { seedDefaultCountries } from "./createCountries.js";

export default {
    validator: validator({
        query: Joi.object({
            page: Joi.number().optional(),
            limit: Joi.number().optional()
        })
    }),
    handler: async (req, res) => {
        try {
            const existingCountries = await Country.findAll();

            if (existingCountries.length === 0) {
                await seedDefaultCountries();
                const countries = await Country.findAll();
                return responseHandler.success(res, "Countries fetched successfully", countries);
            }

            return responseHandler.success(res, "Countries fetched successfully", existingCountries);
        } catch (error) {
            return responseHandler.error(res, error?.message);
        }
    }
}