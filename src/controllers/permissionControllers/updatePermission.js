import Joi from "joi";
import Permission from "../../models/permissionModel.js";
import validator from "../../utils/validator.js";
import responseHandler from "../../utils/responseHandler.js";
import { Op } from "sequelize";

export default {
    validator: validator({
        params: Joi.object({
            id: Joi.string().required()
        }),
        body: Joi.object({
            permissions: Joi.object().allow(null).required()
        })
    }),
    handler: async (req, res) => {
        try {
            const { id } = req.params;
            const { permissions } = req.body;

            const permission = await Permission.findByPk(id);

            if (!permission) {
                return responseHandler.notFound(res, "Permission not found");
            }

            const existingPermission = await Permission.findOne({ where: { permissions, id: { [Op.not]: id } } });
            if (existingPermission) {
                return responseHandler.error(res, "Permission already exists");
            }

            await permission.update({
                permissions: permissions || permission.permissions,
                updated_by: req.user?.username
            });

            return responseHandler.success(res, "Permission updated successfully", permission);
        } catch (error) {

            return responseHandler.error(res, error?.message);
        }
    }
};
