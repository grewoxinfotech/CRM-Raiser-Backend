import { Router } from "express";
import { createSalesCreditnote, deleteSalesCreditnote, getAllSalesCreditnote, getSalesCreditnoteById, updateSalesCreditnote } from "../controllers/salesCreditnoteControllers/index.js";
import { authenticateUser, checkRole } from "../middlewares/index.js";
import passCompanyDetails from "../middlewares/passCompanyDetail.js";
import queryMiddleware from "../middleware/queryMiddleware.js";
import upload from "../middlewares/upload.js";

const router = Router();
const searchFields = ['id', 'related_id', 'invoice', 'currency', 'amount', 'date', 'description', 'client_id', 'created_by'];

router.use(authenticateUser, checkRole, passCompanyDetails);

router.post("/", upload.single("attachment"), createSalesCreditnote.validator, createSalesCreditnote.handler);
router.get("/", queryMiddleware(searchFields), getAllSalesCreditnote.validator, getAllSalesCreditnote.handler);
router.get("/:id", getSalesCreditnoteById.validator, getSalesCreditnoteById.handler);
router.put("/:id", updateSalesCreditnote.validator, updateSalesCreditnote.handler);
router.delete("/:id", deleteSalesCreditnote.validator, deleteSalesCreditnote.handler);

export default router;
