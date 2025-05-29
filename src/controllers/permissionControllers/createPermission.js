import Joi from "joi";
import Permission from "../../models/permissionModel.js";
import validator from "../../utils/validator.js";
import responseHandler from "../../utils/responseHandler.js";

export default {
    validator: validator({
        body: Joi.object({
            permissions: Joi.object().allow(null).required()
        })
    }),
    handler: async (req, res) => {
        try {
            const { permissions } = req.body;

            // Check if permission already exists
            const existingPermission = await Permission.findOne({
                where: { permissions }
            });

            if (existingPermission) {
                return responseHandler.error(res, "Permission already exists");
            }

            const permission = await Permission.create({
                permissions,
                client_id: req.des?.client_id,
                created_by: req.user?.username,
            });

            return responseHandler.created(res, "Permission created successfully", permission);
        } catch (error) {

            return responseHandler.error(res, error?.message);
        }
    }
}; 