import { Router } from "express";
import { authenticateUser, checkRole } from "../middlewares/index.js";
import {
  createContact,
  getAllContacts,
  getContactById,
  updateContact,
  deleteContact,
} from "../controllers/contactController/index.js";
import passCompanyDetails from "../middlewares/passCompanyDetail.js";
import queryMiddleware from "../middleware/queryMiddleware.js";

const router = Router();
const searchFields = ['id', 'first_name', 'last_name', 'company_name', 'email', 'phone', 'contact_source', 'address', 'city', 'state', 'country', 'client_id', 'created_by'];

router.use(authenticateUser, checkRole, passCompanyDetails);

router.post("/", createContact.validator, createContact.handler);
router.get("/", queryMiddleware(searchFields), getAllContacts.validator, getAllContacts.handler);
router.get("/:id", getContactById.validator, getContactById.handler);
router.put("/:id", updateContact.validator, updateContact.handler);
router.delete("/:id", deleteContact.validator, deleteContact.handler);

export default router;
