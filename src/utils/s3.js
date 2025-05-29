import { AWS_CONFIG } from "../config/config.js";
import AWS from 'aws-sdk';

AWS.config.update({
    accessKeyId: AWS_CONFIG.AWS_ACCESS_KEY_ID,
    secretAccessKey: AWS_CONFIG.AWS_SECRET_ACCESS_KEY,
    region: AWS_CONFIG.AWS_REGION
});

const s3 = new AWS.S3();

const uploadFilesToS3 = async (files) => {
    try {
        const uploadPromises = files.map(async (file) => {
            const params = {
                Bucket: AWS_CONFIG.AWS_BUCKET_NAME,
                Key: `${Date.now()}-${file.originalname}`,
                Body: file.buffer,
                ContentType: file.mimetype
            };

            const result = await s3.upload(params).promise();
            return {
                url: result.Location,
                key: result.Key,
                name: file.originalname
            };
        });

        return await Promise.all(uploadPromises);
    } catch (error) {
        throw new Error('Error uploading files to S3: ' + error.message);
    }
};

const deleteFileFromS3 = async (fileKey) => {
    try {
        const params = {
            Bucket: AWS_CONFIG.AWS_BUCKET_NAME,
            Key: fileKey
        };

        await s3.deleteObject(params).promise();
        return true;
    } catch (error) {
        throw new Error('Error deleting file from S3: ' + error.message);
    }
};

// Get file from S3
const getFileFromS3 = async (fileKey) => {
    try {
        const params = {
            Bucket: AWS_CONFIG.AWS_BUCKET_NAME,
            Key: fileKey
        };

        const data = await s3.getObject(params).promise();
        return data;
    } catch (error) {
        throw new Error('Error getting file from S3: ' + error.message);
    }
};

export default {
    uploadFilesToS3,
    deleteFileFromS3,
    getFileFromS3
}