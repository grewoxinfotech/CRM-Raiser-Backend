import { Router } from "express";
import { createSalesRevenue, deleteSalesRevenue, getAllSalesRevenue, getSalesRevenueById, updateSalesRevenue } from "../controllers/salesRevenueControllers/index.js";
import { authenticateUser, checkRole } from "../middlewares/index.js";
import passCompanyDetails from '../middlewares/passCompanyDetail.js';
import queryMiddleware from "../middleware/queryMiddleware.js";

const router = Router();
const searchFields = ['id', 'related_id', 'currency', 'amount', 'date', 'description', 'salesInvoiceNumber', 'category', 'client_id', 'created_by'];

router.use(authenticateUser, checkRole, passCompanyDetails);

router.post("/", createSalesRevenue.validator, createSalesRevenue.handler);
router.get("/", queryMiddleware(searchFields), getAllSalesRevenue.validator, getAllSalesRevenue.handler);
router.get("/:id", getSalesRevenueById.validator, getSalesRevenueById.handler);
router.put("/:id", updateSalesRevenue.validator, updateSalesRevenue.handler);
router.delete("/:id", deleteSalesRevenue.validator, deleteSalesRevenue.handler);

export default router;