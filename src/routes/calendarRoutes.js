import express from "express";
import { authenticateUser, checkRole } from "../middlewares/index.js";
import { createCalendar, getCalendar, getCalendarByID, updateCalendar, deleteCalendar } from "../controllers/calendarController/index.js";
import passCompanyDetails from '../middlewares/passCompanyDetail.js';
const router = express.Router();

router.use(authenticateUser, checkRole,passCompanyDetails);

router.post('/', createCalendar.validator, createCalendar.handler);
router.get('/', getCalendar.validator, getCalendar.handler);
router.get('/:id', getCalendarByID.validator, getCalendarByID.handler);
router.put('/:id', updateCalendar.validator, updateCalendar.handler);
router.delete('/:id', deleteCalendar.validator, deleteCalendar.handler);


export default router;