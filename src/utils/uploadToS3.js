import { s3, S3_BUCKET_NAME } from "../config/config.js";
import generateId from "../middlewares/generatorId.js";

/**
 * Upload a file to S3 based on user role and path structure
 * @param {object} file - Multer file object
 * @param {string} role - user role (e.g. 'client', 'sub-client', etc.)
 * @param {string} type - file type or category
 * @param {string} name - user or company name
 * @param {string} i1 - optional parent ID (e.g., client ID)
 * @param {string} i2 - unused (reserved for future use)
 * @returns {string} - public URL of uploaded file
 */
const uploadToS3 = async (file, role, type, name, i1, i2) => {
  try {
    if (!file) {
      throw new Error('File is required');
    }

    const date = new Date();
    const uniqueId = generateId();
    const yearMonth = `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}`;
    const fileExtension = file.originalname.split('.').pop();

    let key = '';
    switch (role) {
      case 'super-admin':
        key = `Raiser CRM/superadmin/${name}/${type}/${yearMonth}/${type}_${uniqueId}.${fileExtension}`;
        break;
      case 'client':
        key = `Raiser CRM/clients/${name}/${type}/${yearMonth}/${type}_${uniqueId}.${fileExtension}`;
        break;
      case 'sub-client':
        key = `Raiser CRM/clients/${i1}/subClients/${name}/${type}/${yearMonth}/${type}_${uniqueId}.${fileExtension}`;
        break;
      case 'employee':
        key = `Raiser CRM/clients/${i1}/employees/${name}/${type}/${yearMonth}/${type}_${uniqueId}.${fileExtension}`;
        break;
      default:
        key = `Raiser CRM/others/${type}/${yearMonth}/${type}_${uniqueId}.${fileExtension}`;
    }

    const params = {
      Bucket: S3_BUCKET_NAME,
      Key: key,
      Body: file.buffer,
      ContentType: file.mimetype,
      ACL: 'private' // Ensure files are private by default
    };

    const data = await s3.upload(params).promise();
    return data.Location;
  } catch (error) {
    console.error('S3 Upload Error:', error);
    throw new Error(`Failed to upload file: ${error.message}`);
  }
};

/**
 * Calculates total S3 storage used by a user based on role
 * @param {string} role - 'client' | 'sub-client' | 'employee'
 * @param {string} name - name of the user (folder)
 * @param {string} i1 - parent ID (e.g. client ID for sub-client/employee)
 * @returns {Object} usage - { totalFiles, totalSizeBytes, totalSizeMB }
 */
const getS3StorageUsageByRole = async (role, name, i1 = '') => {
  try {
    if (!S3_BUCKET_NAME) {
      throw new Error('S3 bucket name is not configured');
    }

    // First check if we have list permissions
    try {
      await s3.headBucket({ Bucket: S3_BUCKET_NAME }).promise();
    } catch (error) {
      if (error.code === 'AccessDenied') {
        console.error('S3 Permission Error: Insufficient bucket access permissions');
        throw new Error('Storage calculation failed: Insufficient S3 permissions. Please contact your administrator.');
      }
      throw error;
    }

    let prefix = '';
    switch (role) {
      case 'client':
        prefix = `Raiser CRM/clients/${name}/`;
        break;
      case 'sub-client':
        prefix = `Raiser CRM/clients/${i1}/subClients/${name}/`;
        break;
      case 'employee':
        prefix = `Raiser CRM/clients/${i1}/employees/${name}/`;
        break;
      default:
        throw new Error('Invalid role provided.');
    }

    let continuationToken = null;
    let totalSize = 0;
    let totalFiles = 0;

    do {
      const params = {
        Bucket: S3_BUCKET_NAME,
        Prefix: prefix,
        ContinuationToken: continuationToken
      };

      try {
        const data = await s3.listObjectsV2(params).promise();

        if (data.Contents) {
          data.Contents.forEach(item => {
            totalSize += item.Size;
            totalFiles++;
          });
        }

        continuationToken = data.IsTruncated ? data.NextContinuationToken : null;
      } catch (listError) {
        if (listError.code === 'AccessDenied') {
          console.error('S3 Permission Error:', listError);
          throw new Error('Storage calculation failed: Insufficient S3 permissions. Please verify IAM user permissions include s3:ListBucket.');
        }
        throw listError;
      }

    } while (continuationToken);

    return {
      role,
      name,
      prefix,
      totalFiles,
      totalSizeBytes: totalSize,
      totalSizeMB: (totalSize / (1024 * 1024)).toFixed(2),
      bucketName: S3_BUCKET_NAME // Add bucket name to help with debugging
    };

  } catch (error) {
    console.error('Error fetching S3 usage:', error);
    // Add more context to the error message
    throw new Error(`Failed to calculate storage: ${error.message} (Bucket: ${S3_BUCKET_NAME})`);
  }
};

export { getS3StorageUsageByRole }; // named export
export default uploadToS3;          // default export
