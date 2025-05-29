import express from "express";
import { authenticateUser, checkRole } from "../middlewares/index.js";
import { createLoan, getAllLoan, getLoan, updateLoan, deleteLoan } from "../controllers/loanControllers/index.js";
import passCompanyDetails from '../middlewares/passCompanyDetail.js';
const router = express.Router();

router.use(authenticateUser, checkRole, passCompanyDetails);

router.post("/", createLoan.validator, createLoan.handler);
router.get("/", getAllLoan.validator, getAllLoan.handler);
router.get("/:id", getLoan.validator, getLoan.handler);
router.put("/:id", updateLoan.validator, updateLoan.handler);
router.delete("/:id", deleteLoan.validator, deleteLoan.handler);

export default router;
