import express from "express";
import { createMeeting, getMeetings, getMeetingById, updateMeeting, deleteMeeting } from "../controllers/meetingController/index.js";
import { authenticateUser, checkRole } from "../middlewares/index.js";
import passCompanyDetails from '../middlewares/passCompanyDetail.js';
import queryMiddleware from '../middleware/queryMiddleware.js';

const router = express.Router();

// Define search fields for meetings based on model fields
const searchFields = ['title', 'department', 'status', 'client', 'client_id', 'created_by', 'updated_by'];

router.use(authenticateUser, checkRole, passCompanyDetails);

router.get('/', queryMiddleware(searchFields), getMeetings.validator, getMeetings.handler);
router.post('/', createMeeting.validator, createMeeting.handler);
router.get('/:id', getMeetingById.validator, getMeetingById.handler);
router.put('/:id', updateMeeting.validator, updateMeeting.handler);
router.delete('/:id', deleteMeeting.validator, deleteMeeting.handler);

export default router;