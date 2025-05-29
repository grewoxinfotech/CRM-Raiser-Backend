import Joi from "joi";
import Currency from "../../models/currencyModel.js";
import responseHandler from "../../utils/responseHandler.js";
import validator from "../../utils/validator.js";
const defaultCurrencies = [
    { currencyName: "US Dollar", currencyCode: "USD", currencyIcon: "$" },
    { currencyName: "Euro", currencyCode: "EUR", currencyIcon: "€" },
    { currencyName: "Indian Rupee", currencyCode: "INR", currencyIcon: "₹" },
    { currencyName: "British Pound", currencyCode: "GBP", currencyIcon: "£" },
    { currencyName: "Japanese Yen", currencyCode: "JPY", currencyIcon: "¥" },
    { currencyName: "Canadian Dollar", currencyCode: "CAD", currencyIcon: "C$" },
    { currencyName: "Australian Dollar", currencyCode: "AUD", currencyIcon: "A$" },
    { currencyName: "Swiss Franc", currencyCode: "CHF", currencyIcon: "Fr" },
    { currencyName: "Chinese Yuan", currencyCode: "CNY", currencyIcon: "¥" },
    { currencyName: "Singapore Dollar", currencyCode: "SGD", currencyIcon: "S$" },
    { currencyName: "UAE Dirham", currencyCode: "AED", currencyIcon: "د.إ" },
    { currencyName: "Saudi Riyal", currencyCode: "SAR", currencyIcon: "ر.س" },
    { currencyName: "Qatari Riyal", currencyCode: "QAR", currencyIcon: "ر.ق" },
    { currencyName: "Kuwaiti Dinar", currencyCode: "KWD", currencyIcon: "د.ك" },
    { currencyName: "Omani Rial", currencyCode: "OMR", currencyIcon: "ر.ع." },
    { currencyName: "Bahraini Dinar", currencyCode: "BHD", currencyIcon: "د.ب" },
    { currencyName: "Russian Ruble", currencyCode: "RUB", currencyIcon: "₽" },
    { currencyName: "South Korean Won", currencyCode: "KRW", currencyIcon: "₩" },
    { currencyName: "Mexican Peso", currencyCode: "MXN", currencyIcon: "$" },
    { currencyName: "Brazilian Real", currencyCode: "BRL", currencyIcon: "R$" },
    { currencyName: "South African Rand", currencyCode: "ZAR", currencyIcon: "R" },
    { currencyName: "Turkish Lira", currencyCode: "TRY", currencyIcon: "₺" },
    { currencyName: "Swedish Krona", currencyCode: "SEK", currencyIcon: "kr" },
    { currencyName: "Norwegian Krone", currencyCode: "NOK", currencyIcon: "kr" },
    { currencyName: "Danish Krone", currencyCode: "DKK", currencyIcon: "kr" },
    { currencyName: "New Zealand Dollar", currencyCode: "NZD", currencyIcon: "$" },
    { currencyName: "Hong Kong Dollar", currencyCode: "HKD", currencyIcon: "$" }
];

export const seedDefaultCurrencies = async () => {
    try {
        const existingCurrencies = await Currency.findAll();

        if (existingCurrencies.length === 0) {
            const createdCurrencies = await Promise.all(
                defaultCurrencies.map(async (currency) => {
                    try {
                        return await Currency.create({
                            currencyName: currency.currencyName,
                            currencyCode: currency.currencyCode,
                            currencyIcon: currency.currencyIcon
                        });
                    } catch (error) {
                        return null;
                    }
                })
            );

            return createdCurrencies.filter(c => c !== null);
        }

        return existingCurrencies;
    } catch (error) {
        throw error;
    }
};

export default {
    validator: validator({
        body: Joi.object({
            currencyName: Joi.string().required(),
            currencyIcon: Joi.string().required(),
            currencyCode: Joi.string().required()
        })
    }),
    handler: async (req, res) => {
        try {
            const { currencyName, currencyCode, currencyIcon } = req.body;

            // Check if currency already exists
            const existingCurrency = await Currency.findOne({
                where: { currencyCode }
            });

            if (existingCurrency) {
                return responseHandler.error(res, "Currency already exists");
            }

            const currency = await Currency.create({
                currencyName,
                currencyCode,
                currencyIcon
            });

            return responseHandler.success(res, "Currency created successfully", currency);
        } catch (error) {
            return responseHandler.error(res, error?.message);
        }
    }
};
