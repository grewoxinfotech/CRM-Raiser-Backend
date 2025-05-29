import express from 'express';
import { authenticateUser, checkRole } from '../middlewares/index.js';
import { createJobCategory, getAllJobCategory, getJobCategoryById, updateJobCategory, deleteJobCategory } from '../controllers/JobCategoryController/index.js';
import passCompanyDetails from '../middlewares/passCompanyDetail.js';
const router = express.Router();

router.use(authenticateUser, checkRole, passCompanyDetails);

router.post('/', createJobCategory.validator, createJobCategory.handler);
router.get('/', getAllJobCategory.validator, getAllJobCategory.handler);
router.get('/:id', getJobCategoryById.validator, getJobCategoryById.handler);
router.put('/:id', updateJobCategory.validator, updateJobCategory.handler);
router.delete('/:id', deleteJobCategory.validator, deleteJobCategory.handler);

export default router;