import express from "express";
import { getAllActivity } from "../controllers/activityControllers/index.js";

const router = express.Router();

router.get("/:id", getAllActivity.validator, getAllActivity.handler);

export default router;

