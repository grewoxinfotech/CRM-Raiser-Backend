import express from "express";
import { authenticateUser, checkRole } from "../middlewares/index.js";
import { createPolicy, getPolicies, getPolicyById, updatePolicy, deletePolicy } from "../controllers/policyController/index.js";
import upload from "../middlewares/upload.js";
// import passCompanyDetails from '../middlewares/passCompanyDetail.js';
const router = express.Router();

router.use(authenticateUser, checkRole);

router.post('/', upload.single('file'), createPolicy.validator, createPolicy.handler);
router.get('/', getPolicies.validator, getPolicies.handler);
router.get('/:id', getPolicyById.validator, getPolicyById.handler);
router.put('/:id', upload.single('file'), updatePolicy.validator, updatePolicy.handler);
router.delete('/:id', deletePolicy.validator, deletePolicy.handler);

export default router;