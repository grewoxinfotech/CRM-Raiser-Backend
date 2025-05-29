import express from "express";
import { authenticateUser, checkRole } from "../middlewares/index.js";
import { createDeduction, getAllDeduction, getDeduction, updateDeduction, deleteDeduction } from "../controllers/deductionControllers/index.js";
import passCompanyDetails from '../middlewares/passCompanyDetail.js';
const router = express.Router();

router.use(authenticateUser, checkRole,passCompanyDetails);

router.post("/", createDeduction.validator, createDeduction.handler);
router.get("/", getAllDeduction.validator, getAllDeduction.handler);
router.get("/:id", getDeduction.validator, getDeduction.handler);
router.put("/:id", updateDeduction.validator, updateDeduction.handler);
router.delete("/:id", deleteDeduction.validator, deleteDeduction.handler);

export default router;
