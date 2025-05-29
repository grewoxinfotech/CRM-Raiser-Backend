import express from "express";
import { getAllEmployees, createEmployee, updateEmployee, deleteEmployee } from "../controllers/employeeControllers/index.js";
import { authenticateUser, checkRole } from "../middlewares/index.js";
import { getActiveSubscription } from "../middlewares/checkSubscriptionLimits.js";
import upload from "../middlewares/upload.js";
import passCompanyDetails from "../middlewares/passCompanyDetail.js";
import queryMiddleware from "../middleware/queryMiddleware.js";

const router = express.Router();

// Define search fields based on employee model fields
const searchFields = ['first_name', 'last_name', 'email', 'phone', 'department', 'designation', 'employee_id', 'client_id', 'branch', 'gender', 'joiningDate', 'leaveDate', 'currency', 'salary', 'accountholder', 'accountnumber', 'bankname', 'ifsc', 'client_id'];

router.use(authenticateUser, checkRole, passCompanyDetails);

router.post('/', getActiveSubscription, createEmployee.validator, createEmployee.handler);
router.get('/', queryMiddleware(searchFields), getAllEmployees.validator, getAllEmployees.handler);
router.put('/:id', upload.fields([
    { name: 'profilePic', maxCount: 1 },
    // { name: 'e_signature', maxCount: 1 }
    { name: 'cv', maxCount: 1 }
]), updateEmployee.validator, updateEmployee.handler);
router.delete('/:id', deleteEmployee.validator, deleteEmployee.handler);

export default router;