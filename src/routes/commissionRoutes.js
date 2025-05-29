import express from "express";
import { authenticateUser, checkRole } from "../middlewares/index.js";
import { createCommission, getAllCommission, getCommission, updateCommission, deleteCommission } from "../controllers/commissionControllers/index.js";
import passCompanyDetails from '../middlewares/passCompanyDetail.js';
const router = express.Router();

router.use(authenticateUser, checkRole,passCompanyDetails);

router.post("/", createCommission.validator, createCommission.handler);
router.get("/", getAllCommission.validator, getAllCommission.handler);
router.get("/:id", getCommission.validator, getCommission.handler);
router.put("/:id", updateCommission.validator, updateCommission.handler);
router.delete("/:id", deleteCommission.validator, deleteCommission.handler);

export default router;
