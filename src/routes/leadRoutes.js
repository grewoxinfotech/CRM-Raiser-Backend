import express from "express";
import { createLead, getAllLeads, getLeadById, updateLead, deleteLead, addLeadMembers, addLeadFiles, deleteLeadMembers, deleteLeadFiles } from "../controllers/leadController/index.js";
import { authenticateUser, checkRole } from "../middlewares/index.js";
import upload from "../middlewares/upload.js";
import passCompanyDetails from '../middlewares/passCompanyDetail.js';
import queryMiddleware from '../middleware/queryMiddleware.js';

const router = express.Router();

// Define search fields based on lead model fields
const searchFields = ['leadTitle', 'leadStage', 'pipeline', 'currency', 'leadValue', 'company_id', 'contact_id', 'source', 'category', 'status', 'interest_level', 'lead_score', 'is_converted', 'client_id', 'created_by'];

router.use(authenticateUser, checkRole, passCompanyDetails);

router.post('/', createLead.validator, createLead.handler);
router.get('/', queryMiddleware(searchFields), getAllLeads.validator, getAllLeads.handler);
router.get('/:id', getLeadById.validator, getLeadById.handler);
router.put('/:id', updateLead.validator, updateLead.handler);
router.delete('/:id', deleteLead.validator, deleteLead.handler);

router.post('/membersadd/:id', addLeadMembers.validator, addLeadMembers.handler);
router.post('/membersdel/:id', deleteLeadMembers.validator, deleteLeadMembers.handler);

router.post('/files/:id', upload.fields([{ name: 'lead_files', maxCount: 1 }]), addLeadFiles.validator, addLeadFiles.handler);
router.delete('/files/:id', deleteLeadFiles.validator, deleteLeadFiles.handler);

export default router;