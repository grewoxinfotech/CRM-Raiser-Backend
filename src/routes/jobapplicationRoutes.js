import express from "express";
import { createJobApplication, getAllJobApplication, updateJobApplication, deleteJobApplication } from "../controllers/jobapplicationControllers/index.js";
import { authenticateUser, checkRole } from "../middlewares/index.js";
import upload from "../middlewares/upload.js";
import passCompanyDetails from '../middlewares/passCompanyDetail.js';
import queryMiddleware from '../middleware/queryMiddleware.js';

const router = express.Router();

// Define search fields based on job application model fields
const searchFields = ['job', 'name', 'email', 'phone', 'location', 'total_experience', 'current_location', 'notice_period', 'status', 'applied_source', 'created_by', 'client_id'];

router.use(authenticateUser, checkRole, passCompanyDetails);

router.post("/", upload.single('file'), createJobApplication.validator, createJobApplication.handler);
router.get("/", queryMiddleware(searchFields), getAllJobApplication.validator, getAllJobApplication.handler);
router.put("/:id", upload.single('file'), updateJobApplication.validator, updateJobApplication.handler);
router.delete("/:id", deleteJobApplication.validator, deleteJobApplication.handler);

export default router;
