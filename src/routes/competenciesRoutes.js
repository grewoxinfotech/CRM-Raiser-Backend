import express from "express";
import { createCompetency, getAllCompetencies, getCompetencyById, updateCompetency, deleteCompetency } from "../controllers/competenciesControllers/index.js";
import { authenticateUser, checkRole } from "../middlewares/index.js";

const router = express.Router();

router.use(authenticateUser, checkRole);

router.post('/', createCompetency.validator, createCompetency.handler);
router.get('/', getAllCompetencies.validator, getAllCompetencies.handler);
router.get('/:id', getCompetencyById.validator, getCompetencyById.handler);
router.put('/:id', updateCompetency.validator, updateCompetency.handler);
router.delete('/:id', deleteCompetency.validator, deleteCompetency.handler);


export default router;
