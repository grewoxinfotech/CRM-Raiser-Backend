import express from "express";
import { authenticateUser, checkRole } from "../middlewares/index.js";
import { createAppraisal, getAllAppraisal, getAppraisal, updateAppraisal, deleteAppraisal } from "../controllers/appraisalControllers/index.js";
import passCompanyDetail from "../middlewares/passCompanyDetail.js";

const router = express.Router();

router.use(authenticateUser, checkRole, passCompanyDetail);

router.post("/", createAppraisal.validator, createAppraisal.handler);
router.get("/", getAllAppraisal.validator, getAllAppraisal.handler);
router.get("/:id", getAppraisal.validator, getAppraisal.handler);
router.put("/:id", updateAppraisal.validator, updateAppraisal.handler);
router.delete("/:id", deleteAppraisal.validator, deleteAppraisal.handler);

export default router;
