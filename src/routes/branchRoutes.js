import express from "express";
import { createBranch, getAllBranch, updateBranch, deleteBranch } from "../controllers/branchControllers/index.js";
import { authenticateUser, checkRole } from "../middlewares/index.js";
import passCompanyDetail from "../middlewares/passCompanyDetail.js";
import queryMiddleware from '../middleware/queryMiddleware.js';

const router = express.Router();

// Define search fields based on branch model fields
const searchFields = ['branchName', 'branchAddress', 'branchManager', 'created_by', 'client_id'];

router.use(authenticateUser, checkRole, passCompanyDetail);

router.post('/', createBranch.validator, createBranch.handler);
router.get('/', queryMiddleware(searchFields), getAllBranch.validator, getAllBranch.handler);
router.put('/:id', updateBranch.validator, updateBranch.handler);
router.delete('/:id', deleteBranch.validator, deleteBranch.handler);

export default router;
