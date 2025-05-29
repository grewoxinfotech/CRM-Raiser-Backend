import express from "express";
import { authenticateUser, checkRole } from "../middlewares/index.js";
import { createProjectReport, getAllProjectReports, getProjectReportById, updateProjectReport, deleteProjectReport } from "../controllers/projectReportControllers/index.js";
import passCompanyDetails from '../middlewares/passCompanyDetail.js';
const router = express.Router();

router.use(authenticateUser, checkRole, passCompanyDetails);

router.post('/', createProjectReport.validator, createProjectReport.handler);
router.get('/', getAllProjectReports.validator, getAllProjectReports.handler);
router.get('/:id', getProjectReportById.validator, getProjectReportById.handler);
router.put('/:id', updateProjectReport.validator, updateProjectReport.handler);
router.delete('/:id', deleteProjectReport.validator, deleteProjectReport.handler);

export default router;