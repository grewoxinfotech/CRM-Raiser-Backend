import multer from "multer";
import { UPLOAD_CONFIG } from "../config/config.js";

const storage = multer.memoryStorage();

const fileFilter = (req, file, cb) => {
    const allowedTypes = [
        ...UPLOAD_CONFIG.ALLOWED_FILE_TYPES.IMAGE,
        ...UPLOAD_CONFIG.ALLOWED_FILE_TYPES.VIDEO,
        ...UPLOAD_CONFIG.ALLOWED_FILE_TYPES.DOCUMENT
    ];

    if (allowedTypes.includes(file.mimetype)) {
        cb(null, true);
    } else {
        cb(new Error('Invalid file type'), false);
    }
};

export const chatUpload = multer({
    storage,
    fileFilter,
    limits: {
        fileSize: UPLOAD_CONFIG.MAX_FILE_SIZE,
        files: UPLOAD_CONFIG.MAX_FILES_PER_MESSAGE
    }
});

export default multer({ storage }); // Keep default export for backward compatibility