import express from "express";
import { authenticateUser, checkRole } from "../middlewares/index.js";
import { getAwards, getAwardById, createAward, updateAward, deleteAward } from "../controllers/awardController/index.js";

const router = express.Router();

router.use(authenticateUser, checkRole);

router.post('/', createAward.validator, createAward.handler);
router.get('/', getAwards.validator, getAwards.handler);
router.get('/:id', getAwardById.validator, getAwardById.handler);
router.put('/:id', updateAward.validator, updateAward.handler);
router.delete('/:id', deleteAward.validator, deleteAward.handler);

export default router;