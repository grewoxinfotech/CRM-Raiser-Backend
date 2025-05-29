import express from "express";
import { authenticateUser, checkRole } from "../middlewares/index.js";
import { createOtherPayment, getAllOtherPayment, getOtherPayment, updateOtherPayment, deleteOtherPayment } from "../controllers/otherPaymentControllers/index.js";
import passCompanyDetails from '../middlewares/passCompanyDetail.js';
const router = express.Router();

router.use(authenticateUser, checkRole, passCompanyDetails);

router.post("/", createOtherPayment.validator, createOtherPayment.handler);
router.get("/", getAllOtherPayment.validator, getAllOtherPayment.handler);
router.get("/:id", getOtherPayment.validator, getOtherPayment.handler);
router.put("/:id", updateOtherPayment.validator, updateOtherPayment.handler);
router.delete("/:id", deleteOtherPayment.validator, deleteOtherPayment.handler);

export default router;
