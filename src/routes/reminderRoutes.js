import express from 'express';
import { createReminder, getAllReminder, updateReminder, deleteReminder } from '../controllers/reminderControllers/index.js';
import { authenticateUser, checkRole } from '../middlewares/index.js';
import passCompanyDetails from '../middlewares/passCompanyDetail.js';
const router = express.Router();


router.use(authenticateUser, checkRole, passCompanyDetails);
router.post('/', createReminder.validator, createReminder.handler);
router.get('/', getAllReminder.validator, getAllReminder.handler);
router.put('/:id', updateReminder.validator, updateReminder.handler);
router.delete('/:id', deleteReminder.validator, deleteReminder.handler);

export default router;
