import { Router } from "express";
import { createCountries, getAllCountries, updateCountries, deleteCountries } from "../controllers/countriesControllers/index.js";
import { authenticateUser, checkRole } from "../middlewares/index.js";

const router = Router();

router.use(authenticateUser, checkRole);

router.post("/", createCountries.validator, createCountries.handler);
router.get("/", getAllCountries.validator, getAllCountries.handler);
router.put("/:id", updateCountries.validator, updateCountries.handler);
router.delete("/:id", deleteCountries.validator, deleteCountries.handler);

export default router;