import { Router } from "express";
import { createDeal, deleteDeal, getAllDeal, updateDeal, getDealById, addDealFiles, deleteDealFiles } from "../controllers/dealControllers/index.js";
import { authenticateUser, checkRole } from "../middlewares/index.js";
import passCompanyDetails from '../middlewares/passCompanyDetail.js';
import upload from "../middlewares/upload.js";
import queryMiddleware from '../middleware/queryMiddleware.js';

const router = Router();

// Define search fields based on deal model fields
const searchFields = ['dealTitle', 'currency', 'value', 'pipeline', 'stage', 'status', 'category', 'source', 'closedDate', 'company_id', 'contact_id', 'deal_members', 'client_id', 'is_won', 'created_by', 'updated_by'];

router.use(authenticateUser, checkRole, passCompanyDetails);

router.post("/", createDeal.validator, createDeal.handler);
router.get("/", queryMiddleware(searchFields), getAllDeal.validator, getAllDeal.handler);
router.get("/:id", getDealById.validator, getDealById.handler);
router.put("/:id", upload.fields([{ name: 'deal_files', maxCount: 1 }]), updateDeal.validator, updateDeal.handler);
router.delete("/:id", deleteDeal.validator, deleteDeal.handler);

router.post('/files/:id', upload.fields([{ name: 'deal_files', maxCount: 1 }]), addDealFiles.validator, addDealFiles.handler);
router.delete('/files/:id', deleteDealFiles.validator, deleteDealFiles.handler);

export default router;