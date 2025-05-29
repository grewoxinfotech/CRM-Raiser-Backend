import express from 'express';
import { createSalary, getAllSalary, getSalaryById, updateSalary, deleteSalary } from '../controllers/salaryController/index.js';
import { authenticateUser, checkRole } from '../middlewares/index.js';
import passCompanyDetails from '../middlewares/passCompanyDetail.js';
import queryMiddleware from '../middleware/queryMiddleware.js';

const router = express.Router();

// Define search fields based on salary model fields
const searchFields = [
    'employeeId',
    'payslipType',
    'currency',
    'salary',
    'netSalary',
    'status',
    'paymentDate',
    'bankAccount',
    'client_id',
    'created_by',
    'updated_by'
];

router.use(authenticateUser, checkRole, passCompanyDetails);
router.post('/', createSalary.validator, createSalary.handler);
router.get('/', queryMiddleware(searchFields), getAllSalary.validator, getAllSalary.handler);
router.get('/:id', getSalaryById.validator, getSalaryById.handler);
router.put('/:id', updateSalary.validator, updateSalary.handler);
router.delete('/:id', deleteSalary.validator, deleteSalary.handler);

export default router;
