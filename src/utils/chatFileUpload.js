import { s3 } from "../config/config.js";
import generateId from "../middlewares/generatorId.js";

export const uploadChatFile = async (file, senderId, receiverId) => {
    try {
        const date = new Date();
        const uniqueId = generateId();
        const yearMonth = `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}`;

        // Extract the base64 data
        const base64Data = file.data.split(';base64,').pop();

        // Convert base64 to buffer
        const buffer = Buffer.from(base64Data, 'base64');

        // Create key based on chat participants and file type
        const key = `CRM_07-02-2025/chats/${senderId}/${receiverId}/${yearMonth}/${file.name}_${uniqueId}`;

        const params = {
            Bucket: s3.config.bucketName,
            Key: key,
            Body: buffer,
            ContentType: file.type,
        };

        const data = await s3.upload(params).promise();

        return {
            url: data.Location,
            key: data.Key,
            type: file.type,
            name: file.name,
            size: file.size
        };
    } catch (error) {
        throw new Error(`Error uploading chat file: ${error.message}`);
    }
};

export const deleteChatFile = async (fileKey) => {
    try {
        const params = {
            Bucket: s3.config.bucketName,
            Key: fileKey
        };
        await s3.deleteObject(params).promise();
        return true;
    } catch (error) {
        throw new Error(`Error deleting chat file: ${error.message}`);
    }
};

export default uploadChatFile; 