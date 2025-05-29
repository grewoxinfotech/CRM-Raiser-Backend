import express from "express";
import { authenticateUser, checkUserRole } from "../middlewares/index.js";
import { createPermission, getAllPermissions, getPermissionById, updatePermission, deletePermission } from "../controllers/permissionControllers/index.js";
import passCompanyDetails from '../middlewares/passCompanyDetail.js';
const router = express.Router();

router.use(authenticateUser, checkUserRole(['super-admin']), passCompanyDetails);

router.post('/', createPermission.validator, createPermission.handler);
router.get('/', getAllPermissions.validator, getAllPermissions.handler);
router.get('/:id', getPermissionById.validator, getPermissionById.handler);
router.put('/:id', updatePermission.validator, updatePermission.handler);
router.delete('/:id', deletePermission.validator, deletePermission.handler);

export default router;