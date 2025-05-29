import { Router } from "express";
import { authenticateUser, checkRole } from "../middlewares/index.js";
import {
  createCustomer,
  getCustomers,
  getCustomerById,
  updateCustomer,
  deleteCustomer,
} from "../controllers/customerController/index.js";
import passCompanyDetails from "../middlewares/passCompanyDetail.js";
import queryMiddleware from "../middleware/queryMiddleware.js";

const router = Router();
const searchFields = ['id', 'related_id', 'customerNumber', 'name', 'contact', 'email', 'tax_number', 'client_id', 'created_by'];

router.use(authenticateUser, checkRole, passCompanyDetails);

router.post("/", createCustomer.validator, createCustomer.handler);
router.get("/", queryMiddleware(searchFields), getCustomers.validator, getCustomers.handler);
router.get("/:id", getCustomerById.validator, getCustomerById.handler);
router.put("/:id", updateCustomer.validator, updateCustomer.handler);
router.delete("/:id", deleteCustomer.validator, deleteCustomer.handler);

export default router;
