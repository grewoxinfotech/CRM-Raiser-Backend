import { Router } from "express";
import { authenticateUser, checkRole } from "../middlewares/index.js";
import {
    createCompanyAccount,
    getAllCompanyAccount,
    updateCompanyAccount,
    deleteCompanyAccount
} from "../controllers/companyAccountController/index.js";
import passCompanyDetails from "../middlewares/passCompanyDetail.js";
import queryMiddleware from "../middleware/queryMiddleware.js";

const router = Router();
const searchFields = ['id', 'account_owner', 'company_name', 'company_number', 'email', 'phone_number', 'client_id', 'created_by'];

router.use(authenticateUser, checkRole, passCompanyDetails);

router.post("/", createCompanyAccount.validator, createCompanyAccount.handler);
router.get("/", queryMiddleware(searchFields), getAllCompanyAccount.validator, getAllCompanyAccount.handler);
router.put("/:id", updateCompanyAccount.validator, updateCompanyAccount.handler);
router.delete("/:id", deleteCompanyAccount.validator, deleteCompanyAccount.handler);

export default router;