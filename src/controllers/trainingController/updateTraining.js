import Joi from "joi";
import Training from "../../models/trainingModel.js";
import validator from "../../utils/validator.js";
import responseHandler from "../../utils/responseHandler.js";
import { Op } from "sequelize";

export default {
    validator: validator({
        params: Joi.object({
            id: Joi.string().required()
        }),
        body: Joi.object({
            title: Joi.string().required(),
            category: Joi.string().required(),
            links: Joi.object({
                titles: Joi.array().items(Joi.string()).required(),
                urls: Joi.array().items(Joi.string().uri()).required()
            }).required()
        })
    }),
    handler: async (req, res) => {
        try {
            const { id } = req.params;
            const { category, links, title } = req.body;

            // Validate that titles and urls arrays have the same length
            if (links.titles.length !== links.urls.length) {
                return responseHandler.error(res, "Number of titles must match number of urls");
            }

            const existingTraining = await Training.findOne({
                where: {
                    category,
                    id: { [Op.not]: id }
                }
            });

            if (existingTraining) {
                return responseHandler.error(res, "Training already exists for this category");
            }

            const training = await Training.findByPk(id);
            if (!training) {
                return responseHandler.error(res, "Training not found");
            }

            await training.update({
                category,
                title,
                links,
                updated_by: req.user?.username
            });

            return responseHandler.success(res, "Training updated successfully", training);
        } catch (error) {
            return responseHandler.error(res, error.message);
        }
    }
}
