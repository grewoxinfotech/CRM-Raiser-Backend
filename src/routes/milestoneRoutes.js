import { Router } from "express";
import { authenticateUser, checkRole } from "../middlewares/index.js";
import { createMilestone, deleteMilestone, getAllMilestone, updateMilestone } from "../controllers/milestoneControllers/index.js";
import passCompanyDetails from '../middlewares/passCompanyDetail.js';
const router = Router();
router.use(authenticateUser, checkRole, passCompanyDetails);
router.post("/:id", createMilestone.validator, createMilestone.handler);
router.get("/:id", getAllMilestone.validator, getAllMilestone.handler);
router.put("/:id", updateMilestone.validator, updateMilestone.handler);
router.delete("/:id", deleteMilestone.validator, deleteMilestone.handler);

export default router;