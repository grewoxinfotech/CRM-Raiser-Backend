import { s3, S3_BUCKET_NAME } from "../../config/config.js";
import responseHandler from "../../utils/responseHandler.js";
import User from "../../models/userModel.js";
import Role from "../../models/roleModel.js";

export default {
    handler: async (req, res) => {

        try {
            // Get all clients
            const IsSuperAdmin = req.user.roleName === "super-admin";


            if (!IsSuperAdmin) {
                return responseHandler.error(res, "You are not authorized to access this resource");
            };

            // Get client role id
            const clientRole = await Role.findOne({
                where: { role_name: 'client' }
            });

            if (!clientRole) {
                return responseHandler.error(res, "Client role not found");
            }

            const clients = await User.findAll({
                where: {
                    role_id: clientRole.id // Using role id from roles table
                },
                attributes: ['id', 'username', 'firstName', 'lastName']
            });

            // Get storage info for each client
            const clientStorageInfo = await Promise.all(clients.map(async (client) => {
                try {
                    // Construct the prefix for the client's folder
                    const prefix = `Raiser CRM/clients/${client.username}/`;
                    let totalSize = 0;
                    let totalFiles = 0;
                    let fileTypes = {};
                    let continuationToken = null;

                    do {
                        const listParams = {
                            Bucket: S3_BUCKET_NAME,
                            Prefix: prefix,
                            MaxKeys: 1000
                        };

                        if (continuationToken) {
                            listParams.ContinuationToken = continuationToken;
                        }

                        const response = await s3.listObjectsV2(listParams).promise();

                        if (response.Contents) {
                            response.Contents.forEach(item => {
                                totalSize += item.Size;
                                totalFiles++;

                                // Categorize files by type
                                const fileType = item.Key.split('/')[3] || 'other'; // Get type from path
                                if (!fileTypes[fileType]) {
                                    fileTypes[fileType] = {
                                        count: 0,
                                        size: 0,
                                        files: []
                                    };
                                }
                                fileTypes[fileType].count++;
                                fileTypes[fileType].size += item.Size;

                                // Get signed URL for the file
                                const url = s3.getSignedUrl('getObject', {
                                    Bucket: S3_BUCKET_NAME,
                                    Key: item.Key,
                                    Expires: 3600 // URL expires in 1 hour
                                });

                                fileTypes[fileType].files.push({
                                    name: item.Key.split('/').pop(),
                                    size: (item.Size / (1024 * 1024)).toFixed(2) + ' MB',
                                    lastModified: item.LastModified,
                                    url: url
                                });
                            });
                        }

                        continuationToken = response.IsTruncated ? response.NextContinuationToken : null;

                    } while (continuationToken);

                    // Convert sizes to MB and format file types data
                    const formattedFileTypes = Object.entries(fileTypes).map(([type, data]) => ({
                        type,
                        count: data.count,
                        size: (data.size / (1024 * 1024)).toFixed(2) + ' MB',
                        files: data.files
                    }));

                    return {
                        clientId: client.id,
                        clientName: client.firstName + ' ' + client.lastName,
                        username: client.username,
                        totalFiles,
                        totalSize: (totalSize / (1024 * 1024)).toFixed(2) + ' MB',
                        s3Path: prefix,
                        fileTypes: formattedFileTypes
                    };
                } catch (error) {
                    console.error(`Error processing client ${client.username}:`, error);
                    return {
                        clientId: client.id,
                        clientName: client.firstName + ' ' + client.lastName,
                        username: client.username,
                        error: error.message
                    };
                }
            }));

            return responseHandler.success(res, "Client storage information retrieved successfully", {
                totalClients: clients.length,
                clientsStorage: clientStorageInfo
            });

        } catch (error) {
            console.error('Error getting client storage:', error);
            return responseHandler.error(res, error.message);
        }
    }
}; 