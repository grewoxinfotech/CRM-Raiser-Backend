import express from "express";
import { createDesignation, getAllDesignations, getDesignationById, updateDesignation, deleteDesignation } from "../controllers/designationControllers/index.js";
import { authenticateUser, checkRole } from "../middlewares/index.js";
import passCompanyDetails from '../middlewares/passCompanyDetail.js';
import queryMiddleware from '../middleware/queryMiddleware.js';

const router = express.Router();

// Define search fields based on designation model fields
const searchFields = ['designation_name', 'branch', 'created_by', 'client_id'];

router.use(authenticateUser, checkRole, passCompanyDetails);

router.post("/", createDesignation.validator, createDesignation.handler);
router.get("/", queryMiddleware(searchFields), getAllDesignations.validator, getAllDesignations.handler);
router.get("/:id", getDesignationById.validator, getDesignationById.handler);
router.put("/:id", updateDesignation.validator, updateDesignation.handler);
router.delete("/:id", deleteDesignation.validator, deleteDesignation.handler);

export default router;