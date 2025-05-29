import { s3, S3_BUCKET_NAME } from '../config/config.js';

export const calculateClientStorage = async (username) => {
    try {
        const prefix = `Raiser CRM/clients/${username}/`;
        let totalSize = 0;
        let continuationToken = null;

        do {
            const params = {
                Bucket: S3_BUCKET_NAME,
                Prefix: prefix,
                ContinuationToken: continuationToken
            };

            const response = await s3.listObjectsV2(params).promise();

            // Calculate total size of all objects
            response.Contents?.forEach(object => {
                totalSize += object.Size;
            });

            continuationToken = response.NextContinuationToken;
        } while (continuationToken);

        // Convert bytes to MB with exact precision
        const storageInMB = totalSize / (1024 * 1024);
        // Return the exact value without rounding
        return storageInMB;
    } catch (error) {
        console.error('Error calculating storage:', error);
        return 0;
    }
}; 