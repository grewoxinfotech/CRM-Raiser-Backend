import express from "express";
import { createFollowup, getAllFollowup, deleteFollowup, updateFollowup } from "../controllers/followupControllers/index.js";
import { authenticateUser, checkRole } from "../middlewares/index.js";
import passCompanyDetails from '../middlewares/passCompanyDetail.js';

const router = express.Router();

router.use(authenticateUser, checkRole, passCompanyDetails);

router.post('/:id', createFollowup.validator, createFollowup.handler);
router.get('/:id', getAllFollowup.validator, getAllFollowup.handler);
router.delete('/:id', deleteFollowup.validator, deleteFollowup.handler);
router.put('/:id', updateFollowup.validator, updateFollowup.handler);

export default router;
