import express from "express";
import { createFollowupMeeting, getFollowupMetting, updateFollowupMeeting, deleteFollowupMeeting } from "../controllers/followupMettingControllers/index.js";
import { authenticateUser, checkRole } from "../middlewares/index.js";
import passCompanyDetails from '../middlewares/passCompanyDetail.js';

const router = express.Router();

router.use(authenticateUser, checkRole, passCompanyDetails);

// Create followup meeting
router.post('/:id', createFollowupMeeting.validator, createFollowupMeeting.handler);

// Get all followup meetings
router.get('/:id', getFollowupMetting.validator, getFollowupMetting.handler);

// Update followup meeting  
router.put('/:id', updateFollowupMeeting.validator, updateFollowupMeeting.handler);

// Delete followup meeting
router.delete('/:id', deleteFollowupMeeting.validator, deleteFollowupMeeting.handler);

export default router;
