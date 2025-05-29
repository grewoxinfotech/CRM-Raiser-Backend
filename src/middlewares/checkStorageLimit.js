import { getS3StorageUsageByRole } from '../utils/uploadToS3.js';
import User from '../models/userModel.js';
import Role from '../models/roleModel.js';
import ClientSubscription from '../models/clientSubscriptionModel.js';
import SubscriptionPlan from '../models/subscriptionPlanModel.js';
import responseHandler from '../utils/responseHandler.js';

const checkStorageLimit = async (req, res, next) => {
    try {
        // Get user and role information
        const user = await User.findByPk(req.user.id);
        const role = await Role.findByPk(req.user.role);

        if (!role) {
            return responseHandler.error(res, 'Role not found');
        }

        // Get client information and subscription
        let clientId, clientName;
        if (role.role_name === 'client') {
            clientId = user.id;
            clientName = user.username;
        } else {
            // For employees and sub-clients, get their parent client
            if (!user.client_id) {
                return responseHandler.error(res, 'Client information not found');
            }
            const client = await User.findByPk(user.client_id);
            if (!client) {
                return responseHandler.error(res, 'Parent client not found');
            }
            clientId = client.id;
            clientName = client.username;  // Using the parent client's username for folder structure
        }

        // Store client info in request for use in upload handlers
        req.clientInfo = {
            id: clientId,
            username: clientName,
            role: role.role_name
        };

        // Get subscription plan details
        const subscription = await ClientSubscription.findOne({
            where: { client_id: clientId, status: ['active', 'trial'] }
        });

        if (!subscription) {
            return responseHandler.error(res, 'No active subscription found');
        }

        const plan = await SubscriptionPlan.findByPk(subscription.plan_id);
        if (!plan) {
            return responseHandler.error(res, 'Subscription plan not found');
        }

        // Get current storage usage using the client's username for folder path
        const storageUsage = await getS3StorageUsageByRole('client', clientName);
        const currentUsageMB = parseFloat(storageUsage.totalSizeMB);

        // Plan storage limit is already in MB
        const storageLimitMB = parseFloat(plan.storage_limit);

        // Check if file upload would exceed storage limit
        let uploadSizeMB = 0;
        if (req.file) {
            uploadSizeMB = req.file.size / (1024 * 1024); // Convert bytes to MB
        } else if (req.files) {
            uploadSizeMB = Object.values(req.files).reduce((total, file) => {
                if (Array.isArray(file)) {
                    // Handle multiple files in the same field
                    return total + file.reduce((fieldTotal, f) => fieldTotal + f.size / (1024 * 1024), 0);
                }
                return total + file.size / (1024 * 1024);
            }, 0);
        }

        console.log('Storage Check:', {
            clientName,
            currentUsage: currentUsageMB.toFixed(2) + 'MB',
            uploadSize: uploadSizeMB.toFixed(2) + 'MB',
            planLimit: storageLimitMB + 'MB',
            planName: plan.name
        });

        if (currentUsageMB + uploadSizeMB > storageLimitMB) {
            return responseHandler.error(res,
                `Storage limit exceeded. Current usage: ${currentUsageMB.toFixed(2)}MB, ` +
                `Upload size: ${uploadSizeMB.toFixed(2)}MB, ` +
                `Plan limit: ${storageLimitMB}MB`
            );
        }

        // Add storage information to request
        req.storageInfo = {
            currentUsage: currentUsageMB,
            uploadSize: uploadSizeMB,
            limit: storageLimitMB,
            remainingStorage: storageLimitMB - currentUsageMB,
            plan: plan.name,
            clientName: clientName  // Add client name for use in upload paths
        };

        next();
    } catch (error) {
        console.error('Storage limit check error:', error);
        return responseHandler.error(res, error.message);
    }
};

export default checkStorageLimit; 