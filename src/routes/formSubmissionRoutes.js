import express from "express";
import {
    getAllFormSubmissions,
    getFormSubmissionById,
    createFormSubmission,
    updateFormSubmission,
    deleteFormSubmission
} from "../controllers/formSubmissionController/index.js";

const router = express.Router();

// Form submission management routes (protected)
router.get("/:formId/submissions", getAllFormSubmissions.validator, getAllFormSubmissions.handler);
router.get("/:id", getFormSubmissionById.validator, getFormSubmissionById.handler);
router.put("/:id", updateFormSubmission.validator, updateFormSubmission.handler);
router.delete("/:id", deleteFormSubmission.validator, deleteFormSubmission.handler);

// Public form submission endpoint (no auth required)
router.post("/:formId/submit", createFormSubmission.validator, createFormSubmission.handler);

export default router;