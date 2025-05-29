import express from 'express';
import { authenticateUser, checkRole } from '../middlewares/index.js';
import { createJobStages, getAllJobStages, getJobStagesById, updateJobStages, deleteJobStages } from '../controllers/JobStagesController/index.js';
import passCompanyDetails from '../middlewares/passCompanyDetail.js';
const router = express.Router();

router.use(authenticateUser, checkRole, passCompanyDetails);

router.post('/', createJobStages.validator, createJobStages.handler);
router.get('/', getAllJobStages.validator, getAllJobStages.handler);
router.get('/:id', getJobStagesById.validator, getJobStagesById.handler);
router.put('/:id', updateJobStages.validator, updateJobStages.handler);
router.delete('/:id', deleteJobStages.validator, deleteJobStages.handler);

export default router;