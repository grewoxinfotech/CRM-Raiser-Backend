import Joi from "joi";
import validator from "../../utils/validator.js";
import responseHandler from "../../utils/responseHandler.js";
import { ClientSubscription, SubscriptionPlan } from "../../models/associations.js";
import User from "../../models/userModel.js";
import { calculateClientStorage } from "../../utils/calculateStorage.js";
import { updateSubscriptionCounts } from "../../utils/updateSubscriptionCounts.js";

export default {
    validator: validator({
        query: Joi.object({
            page: Joi.number().optional(),
            limit: Joi.number().optional(),
        })
    }),
    handler: async (req, res) => {
        try {
            const assignedPlans = await ClientSubscription.findAll({
                include: [
                    {
                        model: SubscriptionPlan,
                        as: 'Plan',
                        attributes: ['storage_limit']
                    }
                ]
            });

            if (!assignedPlans || assignedPlans.length === 0) {
                return responseHandler.error(res, "No Assigned Plans found");
            }

            // Get all client information
            const clientIds = assignedPlans.map(plan => plan.client_id);
            const clients = await User.findAll({
                where: { id: clientIds },
                attributes: ['id', 'username']
            });

            // Create a map of client_id to username
            const clientMap = {};
            clients.forEach(client => {
                clientMap[client.id] = client.username;
            });

            // Update counts and calculate storage for each client
            const plansWithStorage = await Promise.all(assignedPlans.map(async (plan) => {
                const username = clientMap[plan.client_id];

                // Calculate actual storage used
                const actualStorageUsed = await calculateClientStorage(username);

                // Update subscription counts and storage
                try {
                    await ClientSubscription.update(
                        { current_storage_used: actualStorageUsed },
                        { where: { id: plan.id } }
                    );
                    await updateSubscriptionCounts(plan.client_id);
                    // console.log("updated successfully", plan.client_id)
                } catch (error) {
                    console.error(`Error updating counts for client ${username}:`, error);
                }

                // Refresh plan data after update
                const updatedPlan = await ClientSubscription.findByPk(plan.id, {
                    include: [
                        {
                            model: SubscriptionPlan,
                            as: 'Plan',
                            attributes: ['storage_limit']
                        }
                    ]
                });

                // Get exact storage values
                const totalStorageInMB = parseFloat(updatedPlan.Plan?.storage_limit || 0);
                const usedStorageInMB = actualStorageUsed; // Use the actual calculated value

                return {
                    ...updatedPlan.toJSON(),
                    clientUsername: username,
                    storage: {
                        used: usedStorageInMB,
                        total: totalStorageInMB,
                        percentage: totalStorageInMB > 0 ? (usedStorageInMB / totalStorageInMB) * 100 : 0
                    }
                };
            }));

            return responseHandler.success(res, "Assigned Plans fetched successfully", plansWithStorage);
        } catch (error) {
            console.error('Error in getAllAssignedPlans:', error);
            return responseHandler.error(res, error?.message || "Internal Server Error");
        }
    }
}; 