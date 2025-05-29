import Joi from "joi";
import Country from "../../models/countriesModel.js";
import validator from "../../utils/validator.js";
import responseHandler from "../../utils/responseHandler.js";

const defaultCountries = [
    { countryName: "United States", countryCode: "US", phoneCode: "+1" },
    { countryName: "United Kingdom", countryCode: "GB", phoneCode: "+44" },
    { countryName: "India", countryCode: "IN", phoneCode: "+91" },
    { countryName: "Canada", countryCode: "CA", phoneCode: "+1" },
    { countryName: "Australia", countryCode: "AU", phoneCode: "+61" },
    { countryName: "Germany", countryCode: "DE", phoneCode: "+49" },
    { countryName: "France", countryCode: "FR", phoneCode: "+33" },
    { countryName: "Japan", countryCode: "JP", phoneCode: "+81" },
    { countryName: "China", countryCode: "CN", phoneCode: "+86" },
    { countryName: "Singapore", countryCode: "SG", phoneCode: "+65" },
    { countryName: "United Arab Emirates", countryCode: "AE", phoneCode: "+971" },
    { countryName: "Saudi Arabia", countryCode: "SA", phoneCode: "+966" },
    { countryName: "Qatar", countryCode: "QA", phoneCode: "+974" },
    { countryName: "Kuwait", countryCode: "KW", phoneCode: "+965" },
    { countryName: "Oman", countryCode: "OM", phoneCode: "+968" },
    { countryName: "Bahrain", countryCode: "BH", phoneCode: "+973" },
    { countryName: "Russia", countryCode: "RU", phoneCode: "+7" },
    { countryName: "South Korea", countryCode: "KR", phoneCode: "+82" },
    { countryName: "Mexico", countryCode: "MX", phoneCode: "+52" },
    { countryName: "Brazil", countryCode: "BR", phoneCode: "+55" }
];

export const seedDefaultCountries = async () => {
    try {
        const existingCountries = await Country.findAll();

        if (existingCountries.length === 0) {
            const createdCountries = await Promise.all(
                defaultCountries.map(async (country) => {
                    try {
                        return await Country.create({
                            countryName: country.countryName,
                            countryCode: country.countryCode,
                            phoneCode: country.phoneCode
                        });
                    } catch (error) {
                        return null;
                    }
                })
            );

            return createdCountries.filter(c => c !== null);
        }

        return existingCountries;
    } catch (error) {
        throw error;
    }
};

export default {
    validator: validator({
        body: Joi.object({
            countryName: Joi.string().required(),
            countryCode: Joi.string().required(),
            phoneCode: Joi.string().required()
        })
    }),
    handler: async (req, res) => {
        try {
            const { countryName, countryCode, phoneCode } = req.body;

            const existingCountry = await Country.findOne({ where: { countryName } });
            if (existingCountry) {
                return responseHandler.error(res, "Country already exists");
            }

            const country = await Country.create({
                countryName,
                countryCode,
                phoneCode,
                created_by: req.user?.username
            });

            return responseHandler.success(res, "Country created successfully", country);
        } catch (error) {
            return responseHandler.error(res, error);
        }
    }
};
