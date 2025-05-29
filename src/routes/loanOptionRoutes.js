import express from "express";
import { authenticateUser, checkRole } from "../middlewares/index.js";
import { createLoanOption, getAllLoanOption, getLoanOption, updateLoanOption, deleteLoanOption } from "../controllers/LoanOptionControllers/index.js";
import passCompanyDetails from '../middlewares/passCompanyDetail.js';
const router = express.Router();

router.use(authenticateUser, checkRole, passCompanyDetails);

router.post("/", createLoanOption.validator, createLoanOption.handler);
router.get("/", getAllLoanOption.validator, getAllLoanOption.handler);
router.get("/:id", getLoanOption.validator, getLoanOption.handler);
router.put("/:id", updateLoanOption.validator, updateLoanOption.handler);
router.delete("/:id", deleteLoanOption.validator, deleteLoanOption.handler);

export default router;
