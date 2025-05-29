import express from "express";
import { createEsignature, getAllEsignature, deleteEsignature } from "../controllers/esignatureControllers/index.js";
import { authenticateUser, checkRole } from "../middlewares/index.js";
import passCompanyDetails from '../middlewares/passCompanyDetail.js';
import upload from "../middlewares/upload.js";
const router = express.Router();

router.use(authenticateUser, checkRole, passCompanyDetails);

router.post("/", upload.fields([{ name: 'e_signatures', maxCount: 1 }]), createEsignature.validator, createEsignature.handler);
router.get("/", getAllEsignature.validator, getAllEsignature.handler);
router.delete("/:id", deleteEsignature.validator, deleteEsignature.handler);

export default router;

