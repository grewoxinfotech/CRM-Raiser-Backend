import express from "express";
import { authenticateUser, checkRole } from "../middlewares/index.js";
import { createQuotation, getAllQuotations, updateQuotation, deleteQuotation, leadQuotation, updateLeadQuotation } from "../controllers/quotationsControllers/index.js";
import passCompanyDetails from '../middlewares/passCompanyDetail.js';
const router = express.Router();

router.use(authenticateUser, checkRole, passCompanyDetails);

router.post('/:id', createQuotation.validator, createQuotation.handler);
router.get('/:id', getAllQuotations.validator, getAllQuotations.handler);
router.put('/:id', updateQuotation.validator, updateQuotation.handler);
router.delete('/:id', deleteQuotation.validator, deleteQuotation.handler);
router.post('/lead/:id', leadQuotation.validator, leadQuotation.handler);
router.put('/lead/:id', updateLeadQuotation.validator, updateLeadQuotation.handler);
// router.get('/lead/:id', getLeadQuotation.validator, getLeadQuotation.handler);

export default router;