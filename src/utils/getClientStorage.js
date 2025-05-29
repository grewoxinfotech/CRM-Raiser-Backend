import { s3, S3_BUCKET_NAME } from "../config/config.js";

async function getClientStorageUsage(clientName) {
    try {
        console.log('Checking storage for client:', clientName);
        console.log('S3 Bucket:', S3_BUCKET_NAME);
        console.log('AWS Region:', s3.config.region);

        // First check if we can access the bucket
        try {
            await s3.headBucket({ Bucket: S3_BUCKET_NAME }).promise();
            console.log('✅ Bucket access verified');
        } catch (bucketError) {
            console.error('❌ Bucket access failed:', {
                code: bucketError.code,
                message: bucketError.message,
                statusCode: bucketError.statusCode
            });
            throw new Error(`Cannot access bucket: ${bucketError.message}`);
        }

        // Construct the prefix for the client's folder
        const prefix = `Raiser CRM/clients/${clientName}/`;
        console.log('Checking path:', prefix);

        let totalSize = 0;
        let totalFiles = 0;
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
                });
            }

            continuationToken = response.IsTruncated ? response.NextContinuationToken : null;

            console.log(`Found ${response.Contents?.length || 0} files in this batch`);

        } while (continuationToken);

        const usage = {
            clientName,
            totalFiles,
            totalSizeBytes: totalSize,
            totalSizeMB: (totalSize / (1024 * 1024)).toFixed(2),
            path: prefix
        };

        console.log('\nStorage Usage Summary:');
        console.log('----------------------------------------');
        console.log('Client:', usage.clientName);
        console.log('Total Files:', usage.totalFiles);
        console.log('Total Size:', usage.totalSizeMB, 'MB');
        console.log('S3 Path:', usage.path);

        return usage;

    } catch (error) {
        console.error('Error calculating storage:', {
            code: error.code,
            message: error.message,
            statusCode: error.statusCode,
            requestId: error.requestId
        });

        if (error.code === 'Forbidden') {
            console.log('\nPermission Error: Please ensure your IAM user has these permissions:');
            console.log('1. s3:ListBucket');
            console.log('2. s3:GetObject');
            console.log('3. s3:GetBucketLocation');
            console.log('\nFor bucket:', S3_BUCKET_NAME);
        }

        throw error;
    }
}

// Run the storage check
getClientStorageUsage('Silverline Systems').catch(error => {
    console.error('Failed to get storage usage:', error.message);
}); 