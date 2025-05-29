import express from 'express';
import { authenticateUser, checkRole } from '../middlewares/index.js';
import { createDocumentType, getAllDocumentTypes, getDocumentTypeById, updateDocumentType, deleteDocumentType } from '../controllers/DocumentsTypeController/index.js';
import passCompanyDetails from '../middlewares/passCompanyDetail.js';
const router = express.Router();

router.use(authenticateUser, checkRole,passCompanyDetails);

router.post('/', createDocumentType.validator, createDocumentType.handler);
router.get('/', getAllDocumentTypes.validator, getAllDocumentTypes.handler);
router.get('/:id', getDocumentTypeById.validator, getDocumentTypeById.handler);
router.put('/:id', updateDocumentType.validator, updateDocumentType.handler);
router.delete('/:id', deleteDocumentType.validator, deleteDocumentType.handler);

export default router;