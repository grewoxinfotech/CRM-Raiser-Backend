import express from 'express';
import { authenticateUser, checkRole } from '../middlewares/index.js';
import { createPerformanceType, getAllPerformanceType, getPerformanceTypeById, updatePerformanceType, deletePerformanceType } from '../controllers/PerformanceTypeController/index.js';
import passCompanyDetails from '../middlewares/passCompanyDetail.js';
const router = express.Router();

router.use(authenticateUser, checkRole, passCompanyDetails);

router.post('/', createPerformanceType.validator, createPerformanceType.handler);
router.get('/', getAllPerformanceType.validator, getAllPerformanceType.handler);
router.get('/:id', getPerformanceTypeById.validator, getPerformanceTypeById.handler);
router.put('/:id', updatePerformanceType.validator, updatePerformanceType.handler);
router.delete('/:id', deletePerformanceType.validator, deletePerformanceType.handler);

export default router;