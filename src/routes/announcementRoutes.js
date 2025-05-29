import { createAnnouncement, getAllAnnouncement, updateAnnouncement, deleteAnnouncement } from "../controllers/announcementControllers/index.js";
import express from "express";
import { authenticateUser, checkRole } from "../middlewares/index.js";
import passCompanyDetail from "../middlewares/passCompanyDetail.js";
import queryMiddleware from '../middleware/queryMiddleware.js';

const router = express.Router();

router.use(authenticateUser, checkRole, passCompanyDetail);

// Define search fields for announcements
const searchFields = ['title', 'description'];

// Apply validator middleware before query middleware
router.get("/", getAllAnnouncement.validator, queryMiddleware(searchFields), getAllAnnouncement.handler);
router.post("/", createAnnouncement.validator, createAnnouncement.handler);
router.put("/:id", updateAnnouncement.validator, updateAnnouncement.handler);
router.delete("/:id", deleteAnnouncement.validator, deleteAnnouncement.handler);

export default router;
