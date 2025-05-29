import express from "express";
import { authenticateUser, checkRole } from "../middlewares/index.js";
import { createExpense, getAllExpenses, updateExpense, deleteExpense } from "../controllers/expenseControllers/index.js";
import upload from "../middlewares/upload.js";
import passCompanyDetails from '../middlewares/passCompanyDetail.js';
const router = express.Router();

router.use(authenticateUser, checkRole, passCompanyDetails);

router.post('/:id', upload.fields([{ name: 'bill', maxCount: 1 }]), createExpense.validator, createExpense.handler);
router.get('/:id', getAllExpenses.validator, getAllExpenses.handler);
router.put('/:id', updateExpense.validator, updateExpense.handler);
router.delete('/:id', deleteExpense.validator, deleteExpense.handler);

export default router;