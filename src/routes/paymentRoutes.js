import { Router } from "express";
import { createPayment, deletePayment, getAllPayment, updatePayment } from "../controllers/paymentControllers/index.js";
import { authenticateUser, checkRole } from "../middlewares/index.js";
import upload from "../middlewares/upload.js";
import passCompanyDetails from '../middlewares/passCompanyDetail.js';
const router = Router();

router.use(authenticateUser, checkRole, passCompanyDetails);

router.post('/:id', createPayment.validator, createPayment.handler);
router.get('/:id', getAllPayment.validator, getAllPayment.handler);
router.put('/:id', upload.single('receipt'), updatePayment.validator, updatePayment.handler);
router.delete('/:id', deletePayment.validator, deletePayment.handler);

export default router;