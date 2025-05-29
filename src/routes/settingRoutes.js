import { Router } from "express";
import { authenticateUser, checkRole } from "../middlewares/index.js";
import {
  createSetting,
  getAllSetting,
  deleteSetting,
  updateSetting,
} from "../controllers/settingControllers/index.js";
import upload from "../middlewares/upload.js";
import passCompanyDetails from "../middlewares/passCompanyDetail.js";
const router = Router();

router.use(authenticateUser, checkRole, passCompanyDetails);

router.post(
  "/:id",
  upload.fields([
    { name: "companylogo", maxCount: 1 },
    { name: "favicon", maxCount: 1, optional: true },
  ]),
  createSetting.validator,
  createSetting.handler
);
router.get("/:id", getAllSetting.validator, getAllSetting.handler);
router.delete("/:id", deleteSetting.validator, deleteSetting.handler);
router.put(
  "/:id",
  upload.fields([
    { name: "companylogo", maxCount: 1 },
    { name: "favicon", maxCount: 1 },
  ]),
  updateSetting.validator,
  updateSetting.handler
);

export default router;
