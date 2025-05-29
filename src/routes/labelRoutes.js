import express from "express";
import { getAllLabel, createLabel, updateLabel, deleteLabel, seedLabelsForClient } from "../controllers/labelControllers/index.js";
import { authenticateUser, checkRole } from "../middlewares/index.js";
import passCompanyDetails from '../middlewares/passCompanyDetail.js';
const router = express.Router();

router.use(authenticateUser, checkRole, passCompanyDetails);

router.post('/:id', createLabel.validator, createLabel.handler);
router.get('/:id', getAllLabel.validator, getAllLabel.handler);
router.put('/:id', updateLabel.validator, updateLabel.handler);
router.delete('/:id', deleteLabel.validator, deleteLabel.handler);
router.post("/seed/:clientId", seedLabelsForClient);

export default router;