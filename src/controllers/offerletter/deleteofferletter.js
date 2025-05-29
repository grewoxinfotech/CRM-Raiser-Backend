import Joi from "joi";
import validator from "../../utils/validator.js";
import responseHandler from "../../utils/responseHandler.js";
import OfferLetter from "../../models/offerletter.js";
import { s3 } from "../../config/config.js";

export default {
    validator: validator({
        params: Joi.object({
            id: Joi.string().required()
        })
    }),
    handler: async (req, res) => {
        try {
            const { id } = req.params;
            const offerletter = await OfferLetter.findByPk(id);
            if (!offerletter) {
                return responseHandler.error(res, "Offer letter not found");
            }
            const file = offerletter.file;
            if (file) {
                const key = decodeURIComponent(file.split(".com/").pop());
                const s3Params = {
                    Bucket: s3.config.bucketName,
                    Key: key,
                };
                await s3.deleteObject(s3Params).promise();
            }
            await offerletter.destroy();
            return responseHandler.success(res, "Offer letter deleted successfully", offerletter);
        } catch (error) {
            return responseHandler.error(res, error?.message);
        }
    }
}

