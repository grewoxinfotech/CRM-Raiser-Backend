import express from 'express';
import { authenticateUser, checkRole } from '../middlewares/index.js';
import { createHoliday, getAllHoliday, updateHoliday, deleteHoliday } from '../controllers/holidayControllers/index.js';
import passCompanyDetails from '../middlewares/passCompanyDetail.js';
import queryMiddleware from '../middleware/queryMiddleware.js';

const router = express.Router();

// Define search fields based on holiday model fields
const searchFields = ['holiday_name', 'leave_type', 'start_date', 'end_date', 'created_by', 'client_id'];

router.use(authenticateUser, checkRole, passCompanyDetails);

router.post('/', createHoliday.validator, createHoliday.handler);
router.get('/', queryMiddleware(searchFields), getAllHoliday.validator, getAllHoliday.handler);
router.put('/:id', updateHoliday.validator, updateHoliday.handler);
router.delete('/:id', deleteHoliday.validator, deleteHoliday.handler);

export default router;