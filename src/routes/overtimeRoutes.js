import express from "express";
import { authenticateUser, checkRole } from "../middlewares/index.js";
import { createOverTime, getAllOverTime, getOverTime, updateOverTime, deleteOverTime } from "../controllers/overTimeControllers/index.js";
import passCompanyDetails from '../middlewares/passCompanyDetail.js';
const router = express.Router();

router.use(authenticateUser, checkRole, passCompanyDetails);

router.post("/", createOverTime.validator, createOverTime.handler);
router.get("/", getAllOverTime.validator, getAllOverTime.handler);
router.get("/:id", getOverTime.validator, getOverTime.handler);
router.put("/:id", updateOverTime.validator, updateOverTime.handler);
router.delete("/:id", deleteOverTime.validator, deleteOverTime.handler);

export default router;
