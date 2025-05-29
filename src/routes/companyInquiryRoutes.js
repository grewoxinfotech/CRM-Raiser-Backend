import express from "express";
import { authenticateUser, checkRole } from "../middlewares/index.js";
import { createCompanyInquiry, getAllCompanyInquiry, updateCompanyInquiry, deleteCompanyInquiry, getCompanyInquiryById } from "../controllers/companyInquiryController/index.js";
import passCompanyDetails from "../middlewares/passCompanyDetail.js";

const router = express.Router();

router.use(authenticateUser, checkRole, passCompanyDetails);

router.post("/", createCompanyInquiry.validator, createCompanyInquiry.handler);
router.get("/", getAllCompanyInquiry.validator, getAllCompanyInquiry.handler);
router.get("/:id", getCompanyInquiryById.validator, getCompanyInquiryById.handler);
router.put("/:id", updateCompanyInquiry.validator, updateCompanyInquiry.handler);
router.delete("/:id", deleteCompanyInquiry.validator, deleteCompanyInquiry.handler);

export default router;
