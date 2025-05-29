import { Router } from "express";
import { createTaskCalendar, getAllTaskCalendar, updateTaskCalendar, deleteTaskCalendar, getTaskCalendarById } from "../controllers/taskcalendarController/index.js";
import { authenticateUser, checkRole } from "../middlewares/index.js";
import passCompanyDetails from '../middlewares/passCompanyDetail.js';
const router = Router();

router.use(authenticateUser, checkRole,passCompanyDetails);

router.post("/", createTaskCalendar.validator, createTaskCalendar.handler);
router.get("/", getAllTaskCalendar.validator, getAllTaskCalendar.handler);
router.get("/:id", getTaskCalendarById.validator, getTaskCalendarById.handler);
router.put("/:id", updateTaskCalendar.validator, updateTaskCalendar.handler);
router.delete("/:id", deleteTaskCalendar.validator, deleteTaskCalendar.handler);

export default router;