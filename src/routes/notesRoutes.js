import { Router } from "express";
import { createNotes, getAllNotes, updateNotes, deleteNotes, leadNote } from "../controllers/noteControllers/index.js";
import { authenticateUser, checkRole } from "../middlewares/index.js";
import passCompanyDetails from '../middlewares/passCompanyDetail.js';
const router = Router();

router.use(authenticateUser, checkRole, passCompanyDetails);

router.post("/:id", createNotes.validator, createNotes.handler);
router.get("/:id", getAllNotes.validator, getAllNotes.handler);
router.put("/:id", updateNotes.validator, updateNotes.handler);
router.delete("/:id", deleteNotes.validator, deleteNotes.handler);

// router.post("/leadnote/:id", leadNote.validator, leadNote.handler);

export default router;