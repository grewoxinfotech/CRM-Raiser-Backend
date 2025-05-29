import express from "express";
import { createInvoice, getAllInvoices, updateInvoice, deleteInvoice, getInvoiceById } from "../controllers/invoiceControllers/index.js";
import { authenticateUser, checkRole } from "../middlewares/index.js";
import passCompanyDetails from '../middlewares/passCompanyDetail.js';
const router = express.Router();

router.use(authenticateUser, checkRole, passCompanyDetails);

router.post('/:id', createInvoice.validator, createInvoice.handler);
router.get('/:id', getAllInvoices.validator, getAllInvoices.handler);
router.get('/single/:id', getInvoiceById.validator, getInvoiceById.handler);
router.put('/:id', updateInvoice.validator, updateInvoice.handler);
router.delete('/:id', deleteInvoice.validator, deleteInvoice.handler);

export default router;  