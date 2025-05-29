import { Router } from "express";
import { getNotification, updateNotification } from "../controllers/notificationControllers/index.js";
import { authenticateUser, checkRole } from "../middlewares/index.js";
import passCompanyDetails from '../middlewares/passCompanyDetail.js';
const router = Router();

router.use(authenticateUser, checkRole, passCompanyDetails);

router.get("/:id", getNotification.validator, getNotification.handler);
router.put("/:id", updateNotification.validator, updateNotification.handler);

export default router;
