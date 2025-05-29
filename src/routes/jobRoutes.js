import express from "express";
import { createJob, getAllJobs, getJobById, updateJob, deleteJob } from "../controllers/jobController/index.js";
import { authenticateUser, checkRole } from "../middlewares/index.js";
import passCompanyDetails from '../middlewares/passCompanyDetail.js';
import queryMiddleware from '../middleware/queryMiddleware.js';

const router = express.Router();

// Define search fields based on job model fields
const searchFields = ['title', 'category', 'skills', 'location', 'interviewRounds', 'startDate', 'endDate', 'totalOpenings', 'status', 'recruiter', 'jobType', 'workExperience', 'currency', 'expectedSalary', 'description', 'created_by', 'client_id'];

router.use(authenticateUser, checkRole, passCompanyDetails);

router.post('/', createJob.validator, createJob.handler);
router.get('/', queryMiddleware(searchFields), getAllJobs.validator, getAllJobs.handler);
router.get('/:id', getJobById.validator, getJobById.handler);
router.put('/:id', updateJob.validator, updateJob.handler);
router.delete('/:id', deleteJob.validator, deleteJob.handler);

export default router;