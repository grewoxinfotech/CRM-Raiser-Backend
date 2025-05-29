import express from 'express';
import { authenticateUser, checkRole } from '../middlewares/index.js';
import { createIndicator, getAllIndicator, getIndicatorById, updateIndicator, deleteIndicator } from '../controllers/indicatorController/index.js';
import passCompanyDetails from '../middlewares/passCompanyDetail.js';
const router = express.Router();

router.use(authenticateUser, checkRole, passCompanyDetails);

router.post('/', createIndicator.validator, createIndicator.handler);
router.get('/', getAllIndicator.validator, getAllIndicator.handler);
router.get('/:id', getIndicatorById.validator, getIndicatorById.handler);
router.put('/:id', updateIndicator.validator, updateIndicator.handler);
router.delete('/:id', deleteIndicator.validator, deleteIndicator.handler);

export default router;