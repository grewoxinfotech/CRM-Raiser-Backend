import express from "express";
import { authenticateUser, checkRole } from "../middlewares/index.js";
import { createInquiryForm, getAllInquiryForm, updateInquiryForm, deleteInquiryForm } from "../controllers/inquiryFormController/index.js";
import passCompanyDetails from "../middlewares/passCompanyDetail.js";

const router = express.Router();

router.use(authenticateUser, checkRole, passCompanyDetails);

// Create inquiry form
router.post("/", createInquiryForm.validator, createInquiryForm.handler);
router.get("/", getAllInquiryForm.validator, getAllInquiryForm.handler);
router.put("/:id", updateInquiryForm.validator, updateInquiryForm.handler);
router.delete("/:id", deleteInquiryForm.validator, deleteInquiryForm.handler);

export default router;
