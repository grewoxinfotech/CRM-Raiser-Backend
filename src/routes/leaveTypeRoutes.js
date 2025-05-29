import express from 'express';
import { authenticateUser, checkRole } from '../middlewares/index.js';
import { createLeaveType, getAllLeavesTypes, getLeaveTypeById, updateLeaveType, deleteLeaveType } from '../controllers/leaveTypeController/index.js';
import passCompanyDetails from '../middlewares/passCompanyDetail.js';
const router = express.Router();

router.use(authenticateUser, checkRole, passCompanyDetails);

router.post('/', createLeaveType.validator, createLeaveType.handler);
router.get('/', getAllLeavesTypes.validator, getAllLeavesTypes.handler);
router.get('/:id', getLeaveTypeById.validator, getLeaveTypeById.handler);
router.put('/:id', updateLeaveType.validator, updateLeaveType.handler);
router.delete('/:id', deleteLeaveType.validator, deleteLeaveType.handler);

export default router;