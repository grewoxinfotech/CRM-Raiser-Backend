import express from "express";
import { authenticateUser, checkRole } from "../middlewares/index.js";
import { createTraining, getAllTrainings, updateTraining, deleteTraining } from "../controllers/trainingController/index.js";
import passCompanyDetails from '../middlewares/passCompanyDetail.js';
import queryMiddleware from '../middleware/queryMiddleware.js';

const router = express.Router();

// Define search fields for trainings based on model fields
const searchFields = ['title', 'category', 'links', 'client_id', 'created_by', 'updated_by'];

router.use(authenticateUser, checkRole, passCompanyDetails);

router.get("/", queryMiddleware(searchFields), getAllTrainings.validator, getAllTrainings.handler);
router.post("/", createTraining.validator, createTraining.handler);
router.put("/:id", updateTraining.validator, updateTraining.handler);
router.delete("/:id", deleteTraining.validator, deleteTraining.handler);

export default router;