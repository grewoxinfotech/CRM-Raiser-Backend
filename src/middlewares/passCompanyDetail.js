import Role from "../models/roleModel.js";
import responseHandler from "../utils/responseHandler.js";
import User from "../models/userModel.js";
import SuperAdmin from "../models/superAdminModel.js";

const passClientId = async (req, res, next) => {
    try {
        const role = await Role.findByPk(req.user?.role);
        if (!role) {
            return responseHandler.error(res, "Invalid role");
        }

        let des = {};

        if (role.role_name === 'client') {
            const user = await User.findByPk(req.user.id);
            if (!user) {
                return responseHandler.error(res, "User not found");
            }
            des = {
                client_id: req.user.id,
                client_plan_id: user.client_plan_id
            };

        } else if (role.role_name === 'super-admin') {
            const superAdmin = await SuperAdmin.findByPk(req.user.id);
            if (!superAdmin) {
                return responseHandler.error(res, "Super admin not found");
            }
            des = {
                client_id: superAdmin.id,
            //     // client_plan_id: superAdmin.client_plan_id
             };
        } else {
            const user = await User.findByPk(req.user.id);
           
            if (!user) {
                return responseHandler.error(res, "User not found");
            }


            des = {
                client_id: user.client_id,
                client_plan_id: user.client_plan_id
            };
        }
        req.des = des;
        next();
    } catch (error) {
        return responseHandler.error(res, error?.message);
    }
};

export default passClientId;
