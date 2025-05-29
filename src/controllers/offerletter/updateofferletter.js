import { Op } from "sequelize";
import Joi from "joi";
import validator from "../../utils/validator.js";
import responseHandler from "../../utils/responseHandler.js";
import OfferLetter from "../../models/offerletter.js";
import { s3 } from "../../config/config.js";
import uploadToS3 from "../../utils/uploadToS3.js";

export default {
    validator: validator({
        params: Joi.object({
            id: Joi.string().required()
        }),
        body: Joi.object({
            job: Joi.string().required(),
            job_applicant: Joi.string().required(),
            currency: Joi.string().required(),
            offer_expiry: Joi.date().required(),
            expected_joining_date: Joi.date().required(),
            salary: Joi.number().required(),
            description: Joi.string().optional().allow('', null),
            files: Joi.object().optional().allow(null)
        })
    }),
    handler: async (req, res) => {
        try {
            const { id } = req.params;
            const file = req.file;
            const { job, job_applicant, currency, offer_expiry, expected_joining_date, salary, description } = req.body;


            const offerletter = await OfferLetter.findByPk(id);
            if (!offerletter) {
                return responseHandler.error(res, "Offer letter not found");
            }
            const existingOfferLetter = await OfferLetter.findOne({ where: { job, job_applicant, id: { [Op.not]: id } } });
            if (existingOfferLetter) {
                return responseHandler.error(res, "Offer letter already exists");
            }
            let fileUrl = offerletter.file;
            if (file) {
                if (fileUrl) {
                    const key = decodeURIComponent(fileUrl.split(".com/").pop());
                    const s3Params = {
                        Bucket: s3.config.bucketName,
                        Key: key,
                    };
                    await s3.deleteObject(s3Params).promise();
                }
                fileUrl = await uploadToS3(file, "client", "offer-letters", req.user?.username);
            }
            await offerletter.update({ job, job_applicant, currency, offer_expiry, expected_joining_date, salary, description, file: fileUrl });
            return responseHandler.success(res, "Offer letter updated successfully", offerletter);
        } catch (error) {
            return responseHandler.error(res, error?.message);
        }
    }
}

