import express from "express";
import {
  createBill,
  getAllBill,
  getBillById,
  updateBill,
  deleteBill,
} from "../controllers/billControllers/index.js";
import downloadBill from "../controllers/billControllers/downloadBill.js";
import { authenticateUser, checkRole } from "../middlewares/index.js";
import passCompanyDetails from "../middlewares/passCompanyDetail.js";
import queryMiddleware from '../middleware/queryMiddleware.js';

const router = express.Router();

// Define search fields based on bill model fields
const searchFields = [
  'billNumber',
  'billDate',
  'subTotal',
  'total',
  'amount',
  'craeted_by',
  'updated_by',
  'client_id',
  'vendor',
  'status',
  'bill_status',
  'currency',
  'discription',
  'note',
  'related_id',
  'upiLink',
  'overallDiscountType',
  'overallDiscount',
  'overallTax'
];

// Public route for downloading bills
router.get("/download/:id", downloadBill.validator, downloadBill.handler);

// Protected routes - require authentication
router.use(authenticateUser, checkRole, passCompanyDetails);

// CRUD operations
router.post("/:id", createBill.validator, createBill.handler);
router.get("/", queryMiddleware(searchFields), getAllBill.validator, getAllBill.handler);
router.get("/:id", getBillById.validator, getBillById.handler);
router.put("/:id", updateBill.validator, updateBill.handler);
router.delete("/:id", deleteBill.validator, deleteBill.handler);

export default router;
