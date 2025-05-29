import Joi from "joi";
import Branch from "../../models/branchModel.js";
import responseHandler from "../../utils/responseHandler.js";
import validator from "../../utils/validator.js";
import { Op } from "sequelize";

export default {
    validator: validator({
        params: Joi.object({
            id: Joi.string().required()
        }),
        body: Joi.object({
            branchName: Joi.string().required(),
            branchAddress: Joi.string().required(),
            branchManager: Joi.string().required()
        })
    }),
    handler: async (req, res) => {
        try {
            const { id } = req.params;
            const { branchName, branchAddress, branchManager } = req.body;
            const branch = await Branch.findByPk(id);
            if (!branch) {
                return responseHandler.error(res, "Branch not found");
            }
            const existingBranch = await Branch.findOne({ where: { branchName, id: { [Op.not]: id } } });
            if (existingBranch) {
                return responseHandler.error(res, "Branch name already exists");
            }
            await branch.update({ branchName, branchAddress, branchManager, updated_by: req.user?.username });
            return responseHandler.success(res, "Branch updated successfully", branch);
        } catch (error) {
            return responseHandler.error(res, error?.message);
        }
    }
};