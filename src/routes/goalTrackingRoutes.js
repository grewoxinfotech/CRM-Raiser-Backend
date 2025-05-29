import express from "express";
import { authenticateUser, checkRole } from "../middlewares/index.js";
import { createGoalTracking, getGoalTracking, getGoalTrackingById, updateGoalTracking, deleteGoalTracking } from "../controllers/goalTrackingController/index.js";
import passCompanyDetails from '../middlewares/passCompanyDetail.js';
const router = express.Router();

router.use(authenticateUser, checkRole, passCompanyDetails);

router.post('/', createGoalTracking.validator, createGoalTracking.handler);
router.get('/', getGoalTracking.validator, getGoalTracking.handler);
router.get('/:id', getGoalTrackingById.validator, getGoalTrackingById.handler);
router.put('/:id', updateGoalTracking.validator, updateGoalTracking.handler);
router.delete('/:id', deleteGoalTracking.validator, deleteGoalTracking.handler);

export default router;

