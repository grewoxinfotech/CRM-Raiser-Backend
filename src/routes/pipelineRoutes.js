import express from "express";
import { authenticateUser, checkRole } from "../middlewares/index.js";
import { createPipeline, getAllPipeline, DeletePipeline, updatePipeline, getPipelineById } from "../controllers/pipelineControllers/index.js";
import passCompanyDetails from '../middlewares/passCompanyDetail.js';
const router = express.Router();

router.use(authenticateUser, checkRole, passCompanyDetails);

router.post('/', createPipeline.validator, createPipeline.handler);
router.get('/', getAllPipeline.validator, getAllPipeline.handler);
router.get('/:id', getPipelineById.validator, getPipelineById.handler);
router.delete('/:id', DeletePipeline.validator, DeletePipeline.handler);
router.put('/:id', updatePipeline.validator, updatePipeline.handler);

export default router;