import { Router } from "express";
import { authenticateUser, checkRole } from "../middlewares/index.js";
import { createofferletter, getofferletter, getofferletterbyid, updateofferletter, deleteofferletter } from "../controllers/offerletter/index.js";
import upload from "../middlewares/upload.js";
import passCompanyDetails from '../middlewares/passCompanyDetail.js';
import queryMiddleware from "../middleware/queryMiddleware.js";

const router = Router();
const searchFields = ['id', 'job', 'job_applicant', 'currency', 'offer_expiry', 'expected_joining_date', 'salary', 'description', 'file', 'status', 'client_id', 'created_by'];

router.use(authenticateUser, checkRole, passCompanyDetails);

router.post("/", upload.single('file'), createofferletter.validator, createofferletter.handler);
router.get("/", queryMiddleware(searchFields), getofferletter.validator, getofferletter.handler);
router.get("/:id", getofferletterbyid.validator, getofferletterbyid.handler);
router.put("/:id", upload.single('file'), updateofferletter.validator, updateofferletter.handler);
router.delete("/:id", deleteofferletter.validator, deleteofferletter.handler);

export default router;