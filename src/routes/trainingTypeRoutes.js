import express from 'express';
import { authenticateUser, checkRole } from '../middlewares/index.js';
import { createTraingingType, getAllTraingingType, getTraingingTypeById, updateTraingingType, deleteTraingingType } from '../controllers/TraingingTypeController/index.js';
import passCompanyDetails from '../middlewares/passCompanyDetail.js';
const router = express.Router();

router.use(authenticateUser, checkRole, passCompanyDetails);

router.post('/', createTraingingType.validator, createTraingingType.handler);
router.get('/', getAllTraingingType.validator, getAllTraingingType.handler);
router.get('/:id', getTraingingTypeById.validator, getTraingingTypeById.handler);
router.put('/:id', updateTraingingType.validator, updateTraingingType.handler);
router.delete('/:id', deleteTraingingType.validator, deleteTraingingType.handler);

export default router;