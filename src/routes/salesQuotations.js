import { Router } from "express";
import { createSalesQuotation, deleteSalesQuotation, getAllSalesQuotation, getSalesQuotationById, updateSalesQuotation } from "../controllers/salesQuotationControllers/index.js";
import { authenticateUser, checkRole } from "../middlewares/index.js";
import passCompanyDetails from '../middlewares/passCompanyDetail.js';
const router = Router();


router.use(authenticateUser, checkRole, passCompanyDetails);

router.post("/", createSalesQuotation.validator, createSalesQuotation.handler);
router.get("/", getAllSalesQuotation.validator, getAllSalesQuotation.handler);
router.get("/:id", getSalesQuotationById.validator, getSalesQuotationById.handler);
router.put("/:id", updateSalesQuotation.validator, updateSalesQuotation.handler);
router.delete("/:id", deleteSalesQuotation.validator, deleteSalesQuotation.handler);

export default router;