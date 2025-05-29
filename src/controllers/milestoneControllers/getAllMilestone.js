import { query } from "express";
import Milestone from "../../models/milestoneModel.js";
import responseHandler from "../../utils/responseHandler.js";
import validator from "../../utils/validator.js";
import Joi from "joi";
import Role from "../../models/roleModel.js";
import User from "../../models/userModel.js";

export default {
    validator: validator({
        params: Joi.object({
            id: Joi.string().required()
        }),
        query: Joi.object({
            page: Joi.number().default(1),
            limit: Joi.number().default(10)
        })
    }),
    handler: async (req, res) => {
        try {
            const { id } = req.params;
            const userRole = req.user.role;
            let milestones;

            // Find role in role model
            const role = await Role.findOne({
                where: { id: userRole }
            });

            if (!role) {
                return responseHandler.error(res, "Role not found");
            }

            if (role.role_name === 'client') {
                // If user is client, find milestones matching their client_id
                milestones = await Milestone.findAll({
                    where: {
                        related_id: id,
                        client_id: req.user.id
                    }
                });
            } else {
                // For other roles, get client_id from user model
                const user = await User.findOne({
                    where: { id: req.user.id }
                });

                if (!user) {
                    return responseHandler.error(res, "User not found");
                }

                milestones = await Milestone.findAll({
                    where: {
                        related_id: id,
                        client_id: user.client_id
                    }
                });
            }

            return responseHandler.success(res, "Milestones fetched successfully", milestones);
        } catch (error) {
            return responseHandler.error(res, error?.message);
        }
    }
}