import express from "express";
import { authenticateUser, checkRole } from "../middlewares/index.js";
import { createCustomForm, getAllCustomForm, updateCustomForm, deleteCustomForm, getCustomFormById } from "../controllers/customFormController/index.js";
import passCompanyDetails from "../middlewares/passCompanyDetail.js";

const router = express.Router();
router.get("/:id", getCustomFormById.validator, getCustomFormById.handler);
router.use(authenticateUser, checkRole, passCompanyDetails);
router.post("/", createCustomForm.validator, createCustomForm.handler);
router.get("/", getAllCustomForm.validator, getAllCustomForm.handler);
router.put("/:id", updateCustomForm.validator, updateCustomForm.handler);
router.delete("/:id", deleteCustomForm.validator, deleteCustomForm.handler);

export default router;
