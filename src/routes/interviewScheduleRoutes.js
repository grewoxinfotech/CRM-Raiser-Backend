import express from "express";
import { authenticateUser, checkRole } from "../middlewares/index.js";
import { createInterviewSchedule, getInterviewSchedules, getInterviewScheduleById, updateInterviewSchedule, deleteInterviewSchedule } from "../controllers/interviewScheduleController/index.js";
import passCompanyDetails from '../middlewares/passCompanyDetail.js';
const router = express.Router();

router.use(authenticateUser, checkRole, passCompanyDetails);

router.post('/', createInterviewSchedule.validator, createInterviewSchedule.handler);
router.get('/', getInterviewSchedules.validator, getInterviewSchedules.handler);
router.get('/:id', getInterviewScheduleById.validator, getInterviewScheduleById.handler);
router.put('/:id', updateInterviewSchedule.validator, updateInterviewSchedule.handler);
router.delete('/:id', deleteInterviewSchedule.validator, deleteInterviewSchedule.handler);

export default router;