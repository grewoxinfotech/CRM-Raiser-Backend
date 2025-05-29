import User from '../models/userModel.js';
import ClientSubscription from '../models/clientSubscriptionModel.js';
import { calculateClientStorage } from './calculateStorage.js';
import { Op } from 'sequelize';

export const updateSubscriptionCounts = async (clientId) => {
    console.log("clientId", clientId)
    try {
        // Find the client's subscription
        const client = await User.findByPk(clientId);
        if (!client || !client.client_plan_id) {
            throw new Error('Client or subscription not found');
        }

        const subscription = await ClientSubscription.findByPk(client.client_plan_id);
        if (!subscription) {
            throw new Error('Subscription not found');
        }

        // Calculate storage used
        const storageUsed = await calculateClientStorage(client.username);

        // Count users
        const usersCount = await User.count({
            where: {
                client_id: clientId,
                role_id: { [Op.in]: ['user'] } // Adjust role IDs as needed
            }
        });

        // Count clients (sub-clients)
        const clientsCount = await User.count({
            where: {
                client_id: clientId,
                role_id: { [Op.in]: ['sub-client'] } // Adjust role IDs as needed
            }
        });

        // Count vendors
        const vendorsCount = await User.count({
            where: {
                client_id: clientId,
                role_id: { [Op.in]: ['vendor'] } // Adjust role IDs as needed
            }
        });

        // Count customers
        const customersCount = await User.count({
            where: {
                client_id: clientId,
                role_id: { [Op.in]: ['customer'] } // Adjust role IDs as needed
            }
        });

        // Update subscription with new counts
        await subscription.update({
            current_storage_used: storageUsed,
            current_users_count: usersCount,
            current_clients_count: clientsCount,
            current_vendors_count: vendorsCount,
            current_customers_count: customersCount
        });

        return {
            storage: storageUsed,
            users: usersCount,
            clients: clientsCount,
            vendors: vendorsCount,
            customers: customersCount
        };
    } catch (error) {
        console.error('Error updating subscription counts:', error);
        throw error;
    }
}; 