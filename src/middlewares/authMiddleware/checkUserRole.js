import Role from "../../models/roleModel.js";
import responseHandler from "../../utils/responseHandler.js";

const checkUserRole = (allowedRoles) => {

    return async (req, res, next) => {
        try {
            if (!req.user || !req.user.id) {
                return responseHandler.error(res, "User not authenticated");
            }
            const user = req.user;
            if (!user) {
                return responseHandler.error(res, "User not found");
            }
            const role = await Role.findByPk(user.role);
            if (!role) {
                return responseHandler.error(res, "Role not found");
            }

            if (!allowedRoles.includes(role.role_name)) {
                return responseHandler.error(res, "Unauthorized access");
            }
            req.role = role;

            next();
        } catch (error) {

            return responseHandler.error(res, error?.message);
        }
    };
};

export default checkUserRole;