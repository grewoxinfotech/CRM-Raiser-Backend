import express from "express";
import { createFollowupTask, getAllFollowupTask, updateFollowupTask, deleteFollowupTask } from "../controllers/followupTaskControllers/index.js";
import { authenticateUser, checkRole } from "../middlewares/index.js";
import passCompanyDetails from '../middlewares/passCompanyDetail.js';

const router = express.Router();

router.use(authenticateUser, checkRole, passCompanyDetails);

router.post('/:id', createFollowupTask.validator, createFollowupTask.handler);

router.get('/:id', getAllFollowupTask.validator, getAllFollowupTask.handler);

router.put('/:id', updateFollowupTask.validator, updateFollowupTask.handler);

router.delete('/:id', deleteFollowupTask.validator, deleteFollowupTask.handler);

export default router;
