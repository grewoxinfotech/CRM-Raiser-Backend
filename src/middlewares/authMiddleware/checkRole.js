import Role from "../../models/roleModel.js";
import responseHandler from "../../utils/responseHandler.js";

export default async function checkRole(req, res, next) {
    try {
        if (!req.user || !req.user.id) {
            return responseHandler.error(res, "User not authenticated");
        }

        const user = req.user;

        const role = await Role.findByPk(user.role);
        if (!role) {
            return responseHandler.error(res, "Role not found");
        }

        req.role = role;
        next();
    } catch (error) {
        return responseHandler.error(res, error?.message);
    }
}
