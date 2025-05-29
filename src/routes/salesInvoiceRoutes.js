import { Router } from "express";
import { createSalesInvoice, deleteSalesInvoice, getAllSalesInvoice, getSalesInvoiceById, updateSalesInvoice, sendInvoiceMail } from "../controllers/salesInvoiceControllers/index.js";
import { authenticateUser, checkRole } from "../middlewares/index.js";
import passCompanyDetails from '../middlewares/passCompanyDetail.js';
import queryMiddleware from "../middleware/queryMiddleware.js";
import upload from "../middlewares/upload.js";

const router = Router();
const searchFields = ['id', 'salesInvoiceNumber', 'related_id', 'customer', 'issueDate', 'dueDate', 'category', 'amount', 'payment_status', 'currency', 'client_id', 'created_by'];

router.use(authenticateUser, checkRole, passCompanyDetails);

router.post("/:id", upload.single("attachment"), createSalesInvoice.validator, createSalesInvoice.handler);
router.get("/", queryMiddleware(searchFields), getAllSalesInvoice.validator, getAllSalesInvoice.handler);
router.get("/:id", getSalesInvoiceById.validator, getSalesInvoiceById.handler);
router.put("/:id", updateSalesInvoice.validator, updateSalesInvoice.handler);
router.delete("/:id", deleteSalesInvoice.validator, deleteSalesInvoice.handler);
router.post("/send-mail/:id", sendInvoiceMail.validator, sendInvoiceMail.handler);

export default router;