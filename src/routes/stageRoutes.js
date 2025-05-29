import express from "express";
import { authenticateUser, checkRole } from "../middlewares/index.js";
import { createStage, getAllStages, updateStage, deleteStage, getStageById } from "../controllers/stageControllers/index.js";
import passCompanyDetails from '../middlewares/passCompanyDetail.js';
const router = express.Router();

router.use(authenticateUser, checkRole, passCompanyDetails);

router.post('/', createStage.validator, createStage.handler);
router.get('/', getAllStages.validator, getAllStages.handler);
router.get('/:id', getStageById.validator, getStageById.handler);
router.put('/:id', updateStage.validator, updateStage.handler);
router.delete('/:id', deleteStage.validator, deleteStage.handler);

export default router;