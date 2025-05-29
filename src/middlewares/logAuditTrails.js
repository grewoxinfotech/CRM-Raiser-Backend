// import AuditTrail from "../models/auditTrailModel.js";

// const methodMappers = {
//     GET: "GET",
//     POST: "POST",
//     PUT: "PUT",
//     DELETE: "DELETE"
// }

// export default async function logAuditTrails(req, res, next) {
//     try {
//         const startTime = Date.now();
//         const originalJson = res.json;
//         res.json = async function (body) {
//             const endTime = Date.now();
//             const duration = (endTime - startTime) / 1000;

//             const fullPath = req.originalUrl;
//             const apiIndex = fullPath.indexOf('api');
//             const pathFromApi = apiIndex !== -1 ? fullPath.substring(apiIndex) : fullPath;

//             await AuditTrail.create({
//                 url: req.originalUrl,
//                 activity: `${methodMappers[req.method]} ${pathFromApi}`,
//                 params: JSON.stringify(req.params),
//                 query: JSON.stringify(req.query),
//                 payload: JSON.stringify(req.body),
//                 response: JSON.stringify(body),
//                 duration: `${duration.toFixed(2)} seconds`
//             });
//             return originalJson.call(this, body);
//         }
//         next();
//     } catch (error) {
//         next();
//     }
// }





import AuditTrail from "../models/auditTrailModel.js";
import { s3 } from "../config/config.js";
import { nanoid } from "nanoid";

const methodMappers = {
    GET: "GET",
    POST: "POST",
    PUT: "PUT",
    DELETE: "DELETE"
};

const uploadToS3 = async (data, type) => {
    // Using the bucket name from .env
    const bucketName = process.env.AWS_BUCKET_NAME; // 'crmmediabucket'
    const key = `audit-logs/${type}/${nanoid()}.json`;
    
    const params = {
        Bucket: bucketName,
        Key: key,
        Body: JSON.stringify(data),
        ContentType: 'application/json'
    };

    try {
        const uploadResult = await s3.upload(params).promise();
        return uploadResult.Key;
    } catch (error) {
        console.error('S3 Upload Error:', error);
        throw error;
    }
};

export default async function logAuditTrails(req, res, next) {
    try {
        const startTime = Date.now();
        const originalJson = res.json;
        
        res.json = async function (body) {
            try {
                const endTime = Date.now();
                const duration = (endTime - startTime) / 1000;

                const fullPath = req.originalUrl;
                const apiIndex = fullPath.indexOf('api');
                const pathFromApi = apiIndex !== -1 ? fullPath.substring(apiIndex) : fullPath;

                // Upload request and response data to S3
                const payloadKey = req.body && Object.keys(req.body).length > 0 
                    ? await uploadToS3(req.body, 'payloads')
                    : null;

                const responseKey = body 
                    ? await uploadToS3(body, 'responses')
                    : null;

                // Create audit trail record
                await AuditTrail.create({
                    url: req.originalUrl,
                    activity: `${methodMappers[req.method]} ${pathFromApi}`,
                    params: Object.keys(req.params || {}).length > 0 
                        ? JSON.stringify(req.params) 
                        : null,
                    query: Object.keys(req.query || {}).length > 0 
                        ? JSON.stringify(req.query) 
                        : null,
                    payload_url: payloadKey,
                    response_url: responseKey,
                    duration: `${duration.toFixed(2)} seconds`
                });

                return originalJson.call(this, body);
            } catch (error) {
                console.error('Error in audit logging:', error);
                return originalJson.call(this, body);
            }
        };
        next();
    } catch (error) {
        console.error('Error in audit middleware:', error);
        next();
    }
}
