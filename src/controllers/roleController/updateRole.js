import Joi from "joi";
import Role from "../../models/roleModel.js";
import responseHandler from "../../utils/responseHandler.js";
import validator from "../../utils/validator.js";
import { Op } from "sequelize";

export default {
    validator: validator({
        params: Joi.object({
            id: Joi.string().required()
        }),
        body: Joi.object({
            role_name: Joi.string().required(),
            permissions: Joi.object().allow(null),
        })
    }),
    handler: async (req, res) => {
        try {
            const { id } = req.params;
            const { role_name, permissions } = req.body;

            const role = await Role.findByPk(id);
            if (!role) {
                return responseHandler.notFound(res, 'Role not found');
            }
            const existingRole = await Role.findOne({ where: { role_name, id: { [Op.not]: id } } });
            if (existingRole) {
                return responseHandler.error(res, "Role already exists");
            }


            await role.update({
                role_name,
                permissions,
                updated_by: req.user?.username
            });
            return responseHandler.success(res, 'Role updated successfully', role);
        } catch (error) {
            return responseHandler.error(res, error?.message);
        }
    }
}