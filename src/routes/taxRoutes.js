import { Router } from "express";
import { createTax, getAllTax, updateTax, deleteTax } from "../controllers/taxControllers/index.js";
import { authenticateUser, checkRole } from "../middlewares/index.js";
import passCompanyDetails from '../middlewares/passCompanyDetail.js';
const router = Router();

router.use(authenticateUser, checkRole, passCompanyDetails);

router.post("/", createTax.validator, createTax.handler);
router.get("/", getAllTax.validator, getAllTax.handler);
router.put("/:id", updateTax.validator, updateTax.handler);
router.delete("/:id", deleteTax.validator, deleteTax.handler);

export default router;