import express from "express";
import { authenticateUser, checkRole } from "../middlewares/index.js";
import { createDocument, getDocuments, getDocumentById, updateDocument, deleteDocument } from "../controllers/documentController/index.js";
import upload from "../middlewares/upload.js";
import passCompanyDetails from '../middlewares/passCompanyDetail.js';
import queryMiddleware from '../middleware/queryMiddleware.js';

const router = express.Router();

// Define search fields for documents
const searchFields = ['name', 'description', 'role', 'file', 'client_id', 'created_by', 'updated_by'];

router.use(authenticateUser, checkRole, passCompanyDetails);

router.get("/", queryMiddleware(searchFields), getDocuments.validator, getDocuments.handler);
router.post("/", upload.single('file'), createDocument.validator, createDocument.handler);
router.get("/:id", getDocumentById.validator, getDocumentById.handler);
router.put("/:id", upload.single('file'), updateDocument.validator, updateDocument.handler);
router.delete("/:id", deleteDocument.validator, deleteDocument.handler);

export default router;