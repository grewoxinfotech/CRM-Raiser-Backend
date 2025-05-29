import express from "express";
import { authenticateUser, checkRole } from "../middlewares/index.js";
import { createPayslipType, getAllPayslipTypes, getPayslipTypeById, updatePayslipType, deletePayslipType } from "../controllers/payslipTypeController/index.js";
import passCompanyDetails from '../middlewares/passCompanyDetail.js';
const router = express.Router();

router.use(authenticateUser, checkRole, passCompanyDetails);

router.post('/', createPayslipType.validator, createPayslipType.handler);
router.get('/', getAllPayslipTypes.validator, getAllPayslipTypes.handler);
router.get('/:id', getPayslipTypeById.validator, getPayslipTypeById.handler);
router.put('/:id', updatePayslipType.validator, updatePayslipType.handler);
router.delete('/:id', deletePayslipType.validator, deletePayslipType.handler);

export default router;
