import express from "express";
import { authenticateUser, checkRole } from "../middlewares/index.js";
import { createAllowance, getAllAllowance, getAllowance, updateAllowance, deleteAllowance } from "../controllers/allowanceControllers/index.js";
import  passCompanyDetails from '../middlewares/passCompanyDetail.js';
const router = express.Router();

router.use(authenticateUser, checkRole, passCompanyDetails);

router.post("/", createAllowance.validator, createAllowance.handler);
router.get("/", getAllAllowance.validator, getAllAllowance.handler);
router.get("/:id", getAllowance.validator, getAllowance.handler);
router.put("/:id", updateAllowance.validator, updateAllowance.handler);
router.delete("/:id", deleteAllowance.validator, deleteAllowance.handler);

export default router;
