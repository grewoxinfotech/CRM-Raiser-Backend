import express from 'express';
import { authenticateUser, checkRole } from '../middlewares/index.js';
import { createTerminationType, getAllTerminationType, getTerminationTypeById, updateTerminationType, deleteTerminationType } from '../controllers/TerminationTypeController/index.js';
import passCompanyDetails from '../middlewares/passCompanyDetail.js';
const router = express.Router();

router.use(authenticateUser, checkRole, passCompanyDetails);

router.post('/', createTerminationType.validator, createTerminationType.handler);
router.get('/', getAllTerminationType.validator, getAllTerminationType.handler);
router.get('/:id', getTerminationTypeById.validator, getTerminationTypeById.handler);
router.put('/:id', updateTerminationType.validator, updateTerminationType.handler);
router.delete('/:id', deleteTerminationType.validator, deleteTerminationType.handler);

export default router;