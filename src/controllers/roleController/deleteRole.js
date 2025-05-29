import Joi from "joi";
import Role from "../../models/roleModel.js";
import User from "../../models/userModel.js";
import validator from "../../utils/validator.js";
import responseHandler from "../../utils/responseHandler.js";

export default {
    validator: validator({
        params: Joi.object({
            id: Joi.string().required()
        })
    }),
    handler: async (req, res) => {
        try {
            const { id } = req.params;

            const role = await Role.findByPk(id);
            if (!role) {
                return responseHandler.notFound(res, 'Role not found');
            }

            const usersWithRole = await User.findOne({
                where: { role_id: id }
            });

            if (usersWithRole) {
                return responseHandler.error(res, 'Cannot delete role as it is assigned to one or more users');
            }

            await role.destroy();
            return responseHandler.success(res, 'Role deleted successfully');
        } catch (error) {
            return responseHandler.error(res, error?.message);
        }
    }
}
