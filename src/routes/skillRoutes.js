import { Router } from "express";
import { createSkill, deleteSkill, getAllSkill, updateSkill } from "../controllers/skillControllers/index.js";
import { authenticateUser, checkRole } from "../middlewares/index.js";
import passCompanyDetails from '../middlewares/passCompanyDetail.js';
const router = Router();


router.use(authenticateUser,checkRole, passCompanyDetails);
router.post("/", createSkill.validator, createSkill.handler);
router.get("/", getAllSkill.validator, getAllSkill.handler);
router.put("/:id", updateSkill.validator, updateSkill.handler);
router.delete("/:id", deleteSkill.validator, deleteSkill.handler);

export default router;