import Joi from "joi";
import Branch from "../../models/branchModel.js";
import responseHandler from "../../utils/responseHandler.js";
import validator from "../../utils/validator.js";

export default {
    validator: validator({
        body: Joi.object({
            branchName: Joi.string().required(),
            branchAddress: Joi.string().required(),
            branchManager: Joi.string().required(),
            
        })
    }),
    handler: async (req, res) => {
        try {
            const { branchName, branchAddress, branchManager } = req.body;

            const existingBranch = await Branch.findOne({ where: { branchName } });
            if (existingBranch) {
                return responseHandler.error(res, "Branch name already exists");
            }

            const branch = await Branch.create({
                branchName,
                branchAddress,
                branchManager,
                client_id: req.des?.client_id,
                created_by: req.user?.username
            });

            return responseHandler.success(res, "Branch created successfully", branch);
        } catch (error) {
            return responseHandler.error(res, error?.message);
        }
    }
};
