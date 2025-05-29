import express from "express";
import { authenticateUser, checkRole } from "../middlewares/index.js";
import { createAllowanceOption, getAllAllowanceOption, getAllowanceOption, updateAllowanceOption, deleteAllowanceOption } from "../controllers/allowanceOptionControllers/index.js";
import passCompanyDetail from "../middlewares/passCompanyDetail.js";

const router = express.Router();

router.use(authenticateUser, checkRole, passCompanyDetail);

router.post("/", createAllowanceOption.validator, createAllowanceOption.handler);
router.get("/", getAllAllowanceOption.validator, getAllAllowanceOption.handler);
router.get("/:id", getAllowanceOption.validator, getAllowanceOption.handler);
router.put("/:id", updateAllowanceOption.validator, updateAllowanceOption.handler);
router.delete("/:id", deleteAllowanceOption.validator, deleteAllowanceOption.handler);

export default router;
