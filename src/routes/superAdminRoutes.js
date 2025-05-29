import express from "express";
import { createSuperAdmin, getAllSuperAdmins, updateSuperAdmin, deleteSuperAdmin, allLogin, getSuperAdmin } from "../controllers/superAdminControllers/index.js";
import { authenticateUser, checkUserRole } from "../middlewares/index.js";
import upload from "../middlewares/upload.js";

const router = express.Router();


router.post("/", createSuperAdmin.validator, createSuperAdmin.handler);


router.use(authenticateUser, checkUserRole(['super-admin']));
router.get('/', getAllSuperAdmins.validator, getAllSuperAdmins.handler);
router.get('/:id', getSuperAdmin.validator, getSuperAdmin.handler);
router.put('/:id', upload.single('profilePic'), updateSuperAdmin.validator, updateSuperAdmin.handler);
router.delete('/:id', deleteSuperAdmin.validator, deleteSuperAdmin.handler);

router.post('/alllogin', allLogin.validator, allLogin.handler)

export default router;
