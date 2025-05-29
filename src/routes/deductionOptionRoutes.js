import express from "express";
import { authenticateUser, checkRole } from "../middlewares/index.js";
import { createDeductionOption, getAllDeductionOption, getDeductionOption, updateDeductionOption, deleteDeductionOption } from "../controllers/DeductionOptionControllers/index.js";
import passCompanyDetails from '../middlewares/passCompanyDetail.js';
const router = express.Router();

router.use(authenticateUser, checkRole,passCompanyDetails);

router.post("/", createDeductionOption.validator, createDeductionOption.handler);
router.get("/", getAllDeductionOption.validator, getAllDeductionOption.handler);
router.get("/:id", getDeductionOption.validator, getDeductionOption.handler);
router.put("/:id", updateDeductionOption.validator, updateDeductionOption.handler);
router.delete("/:id", deleteDeductionOption.validator, deleteDeductionOption.handler);

export default router;
