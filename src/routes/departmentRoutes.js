import express from "express";
import { createDepartment, getAllDepartments, getDepartmentById, updateDepartment, deleteDepartment } from "../controllers/departmentControllers/index.js";
import { authenticateUser, checkRole } from "../middlewares/index.js";
import passCompanyDetails from '../middlewares/passCompanyDetail.js';
import queryMiddleware from '../middleware/queryMiddleware.js';

const router = express.Router();

// Define search fields based on department model fields
const searchFields = ['department_name', 'branch', 'created_by', 'client_id'];

router.use(authenticateUser, checkRole, passCompanyDetails);

router.post("/", createDepartment.validator, createDepartment.handler);
router.get("/", queryMiddleware(searchFields), getAllDepartments.validator, getAllDepartments.handler);
router.get("/:id", getDepartmentById.validator, getDepartmentById.handler);
router.put("/:id", updateDepartment.validator, updateDepartment.handler);
router.delete("/:id", deleteDepartment.validator, deleteDepartment.handler);

export default router;