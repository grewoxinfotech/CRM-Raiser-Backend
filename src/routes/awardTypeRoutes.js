import express from 'express';
import { authenticateUser, checkRole } from '../middlewares/index.js';
import { createAwardType, getAllAwardType, getAwardTypeById, updateAwardType, deleteAwardType } from '../controllers/AwardTypeController/index.js';

const router = express.Router();

router.use(authenticateUser, checkRole);

router.post('/', createAwardType.validator, createAwardType.handler);
router.get('/', getAllAwardType.validator, getAllAwardType.handler);
router.get('/:id', getAwardTypeById.validator, getAwardTypeById.handler);
router.put('/:id', updateAwardType.validator, updateAwardType.handler);
router.delete('/:id', deleteAwardType.validator, deleteAwardType.handler);

export default router;