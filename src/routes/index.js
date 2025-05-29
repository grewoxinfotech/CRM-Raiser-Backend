import express from "express";
import authRoutes from "./authRoutes.js";
import roleRoutes from "./roleRoutes.js";
import clientRoutes from "./clientRoutes.js";
import employeeRoutes from "./employeeRoutes.js";
import departmentRoutes from "./departmentRoutes.js";
import designationRoutes from "./designationRoutes.js";
import attendanceRoutes from "./attendanceRoutes.js";
import permissionRoutes from "./permissionRoutes.js";
import subscriptionRoutes from "./subscriptionRoutes.js";
import announcementRoutes from "./announcementRoutes.js";
import projectRoutes from "./projectRoutes.js";
import meetingRoutes from "./meetingRoutes.js";
import subClientRoutes from "./subClientRoutes.js";
import featureRoutes from "./featureRoutes.js";
import taskCalendarRoutes from "./taskcalendarRoutes.js";
import currencyRoutes from "./currencyRoutes.js";
import branchRoutes from "./branchRoutes.js";
import superAdminRoutes from "./superAdminRoutes.js";
import leadRoutes from "./leadRoutes.js";
import taskRoutes from "./taskRoutes.js";
import countriesRoutes from "./countriesRoutes.js";
import labelRoutes from "./labelRoutes.js";
import contractRoutes from "./contractRoutes.js";
import projectReportRoutes from "./projectReportRoutes.js";
import invoiceRoutes from "./invoiceRoutes.js";
import expenseRoutes from "./expenseRoutes.js";
import paymentRoutes from "./paymentRoutes.js";
import milestoneRoutes from "./milestoneRoutes.js";
import notesRoutes from "./notesRoutes.js";
import activityRoutes from "./activityRoutes.js";
import productsRoutes from "./productsRoutes.js";
import pipelineRoutes from "./pipelineRoutes.js";
import dealRoutes from "./dealRoutes.js";
import quotationsRoutes from "./quotationsRoutes.js";
import proposalRoutes from "./proposalRoutes.js";
import ticketRoutes from "./ticketRoutes.js";
import jobApplicationRoutes from "./jobapplicationRoutes.js";
import jobRoutes from "./jobRoutes.js";
import skillRoutes from "./skillRoutes.js";
import interviewScheduleRoutes from "./interviewScheduleRoutes.js";
import messageRoutes from "./messageRoutes.js";
import trainingRoutes from "./trainingRoutes.js";
import stageRoutes from "./stageRoutes.js";
import notificationRoutes from "./notificationRoutes.js";
import customerRoutes from "./customerRoutes.js";
import salesQuotations from "./salesQuotations.js";
import salesInvoiceRoutes from "./salesInvoiceRoutes.js";
import salesRevenueRoutes from "./salesRevenueRoutes.js";
import salesCreditnoteRoutes from "./salesCreditnoteRoutes.js";
import inquiryRoutes from "./inquiryRoutes.js";
import orderRoutes from "./orderRoutes.js";
import billRoutes from "./billRoutes.js";
import leaveTypeRoutes from "./leaveTypeRoutes.js";
import documentTypeRoutes from "./documentTypeRoutes.js";
import payslipTypeRoutes from "./payslipTypeRoutes.js";
import allowanceOptionRoutes from "./allowanceOptionRoutes.js";
import loanOptionRoutes from "./loanOptionRoutes.js";
import deductionOptionRoutes from "./deductionOptionRoutes.js";
import goalTypeRoutes from "./goalTypeRoutes.js";
import trainingTypeRoutes from "./trainingTypeRoutes.js";
import awardTypeRoutes from "./awardTypeRoutes.js";
import terminationTypeRoutes from "./terminationTypeRoutes.js";
import jobCategoryRoutes from "./jobCategoryRoutes.js";
import jobStageRoutes from "./jobStageRoutes.js";
import performanceTypeRoutes from "./performanceTypeRoutes.js";
import competenciesRoutes from "./competenciesRoutes.js";
import jobonboardingrouter from "./jobonboardingrouter.js";
import salaryRoutes from "./salaryRoutes.js";
import allowanceRoutes from "./allowanceRoutes.js";
import commissionRoutes from "./commissionRoutes.js";
import loanRoutes from "./loanRoutes.js";
import deductionRoutes from "./deductionRoutes.js";
import otherPaymentRoutes from "./otherPaymentRoutes.js";
import overtimeRoutes from "./overtimeRoutes.js";
import leaveRoutes from "./leaveRoutes.js";
import indicatorRoutes from "./indicatorRoutes.js";
import appraisalRoutes from "./appraisalRoutes.js";
import goalTrackingRoutes from "./goalTrackingRoutes.js";
import offerLetterRoutes from "./offerLetterRoutes.js";
import policyRoutes from "./policyRoutes.js";
import documentRoutes from "./documentRoutes.js";
import awardRoutes from "./awardRoutes.js";
import calendarRoutes from "./calendarRoutes.js";
import userRoutes from "./userRoutes.js";
import taxRoutes from "./taxRoutes.js";
import { s3 } from "../config/config.js";
import esignatureRoutes from "./esignatureRoutes.js";
import settingRoutes from "./settingRoutes.js";
import accountRoutes from "./accountRoutes.js";
import vendorRoutes from "./vendorRoutes.js";
import billDebitRoutes from "./billdebitRoutes.js";
import billPaymentRoutes from "./billpayment.js";
import emailRoutes from "./emailRoutes.js";
import holidayRoutes from "./holidayRoutes.js";
import reminderRoutes from "./reminderRoutes.js";
import followupRoutes from "./followupRoutes.js";
import followupTaskRoutes from "./followupTaskRoutes.js";
import contactRoutes from "./contactRoutes.js";
import companyAccountRoutes from "./companyAccountRoutes.js";
import companyInquiryRoutes from "./companyInquiryRoutes.js";
import inquiryFormRoutes from "./inquiryFormRoutes.js";
import customFormRoutes from "./customFormRoutes.js"
import followupMeetingRoutes from "./followupMettingRoutes.js";
import formSubmissionRoutes from "./formSubmissionRoutes.js";
import followupCallRoutes from "./followupCallRoutes.js";
import getClientStorageController from "../controllers/clientControllers/getClientStorageController.js";

const router = express.Router();

//>>>>>>>>>>>>>>  Super Admin  <<<<<<<<<<<<<<<//
router.use("/super-admin", superAdminRoutes);
router.use("/clients", clientRoutes);
router.use("/subscriptions", subscriptionRoutes);
router.use("/currencies", currencyRoutes);
router.use("/countries", countriesRoutes);
router.use("/esignatures", esignatureRoutes);

router.use("/holidays", holidayRoutes);

router.use("/accounts", accountRoutes);
router.use("/vendors", vendorRoutes);

router.use("/bill-debits", billDebitRoutes);
router.use("/bill-payments", billPaymentRoutes);
router.use("/settings", settingRoutes);

router.use("/taxes", taxRoutes);
router.use("/tickets", ticketRoutes);
router.use("/inquiry", inquiryRoutes);
router.use("/features", featureRoutes);

//>>>>>>>>>>>>>>  User Management System  <<<<<<<<<<<<<<<//
router.use("/auth", authRoutes);
router.use("/permissions", permissionRoutes);
router.use("/roles", roleRoutes);
router.use("/sub-clients", subClientRoutes);
router.use("/announcements", announcementRoutes);

//>>>>>>>>>>>>>>  HRM System  <<<<<<<<<<<<<<<//

/** 1. Employee Setup*/
router.use("/employees", employeeRoutes);

/** 2. Payroll Setup*/
router.use("/salary", salaryRoutes);
router.use("/allowance", allowanceRoutes);
router.use("/commission", commissionRoutes);
router.use("/loan", loanRoutes);
router.use("/deduction", deductionRoutes);
router.use("/other-payments", otherPaymentRoutes);
router.use("/overtime", overtimeRoutes);

/** 3. Leave Management Setup*/
router.use("/leaves", leaveRoutes);
router.use("/attendance", attendanceRoutes);

/** 4. Performance Setup*/
router.use("/indicator", indicatorRoutes);
router.use("/appraisal", appraisalRoutes);
router.use("/goal-tracking", goalTrackingRoutes);
router.use("/awards", awardRoutes);

/** 5. Recruitment Setup*/
router.use("/skills", skillRoutes);
router.use("/jobs", jobRoutes);
router.use("/job-applications", jobApplicationRoutes);
router.use("/job-onboarding", jobonboardingrouter);
router.use("/interview-schedules", interviewScheduleRoutes);
router.use("/offer-letters", offerLetterRoutes);

/** 6. Document Setup*/
router.use("/documents", documentRoutes);

/** 7. Company policy*/
router.use("/policies", policyRoutes);

/** 8. Meeting Setup*/
router.use("/meetings", meetingRoutes);

/** 9. Training Setup*/
router.use("/trainings", trainingRoutes);

/** 10. HRM System Setup*/
router.use("/branches", branchRoutes);
router.use("/departments", departmentRoutes);
router.use("/designations", designationRoutes);
router.use("/leave-types", leaveTypeRoutes);
router.use("/document-types", documentTypeRoutes);
router.use("/payslip-types", payslipTypeRoutes);
router.use("/allowance-options", allowanceOptionRoutes);
router.use("/loan-options", loanOptionRoutes);
router.use("/deduction-options", deductionOptionRoutes);
router.use("/goal-types", goalTypeRoutes);
router.use("/training-types", trainingTypeRoutes);
router.use("/award-types", awardTypeRoutes);
router.use("/termination-types", terminationTypeRoutes);
router.use("/job-categories", jobCategoryRoutes);
router.use("/job-stages", jobStageRoutes);
router.use("/performance-types", performanceTypeRoutes);
router.use("/competencies", competenciesRoutes);

//>>>>>>>>>>>>>>  Accounting System  <<<<<<<<<<<<<<<//

/** 1. Sales Setup*/
router.use("/customers", customerRoutes);
router.use("/sales-quotations", salesQuotations);
router.use("/sales-invoices", salesInvoiceRoutes);
router.use("/sales-revenue", salesRevenueRoutes);
router.use("/sales-creditnote", salesCreditnoteRoutes);

//>>>>>>>>>>>>>>  CRM System  <<<<<<<<<<<<<<<//

/** 1. Lead Setup*/
router.use("/leads", leadRoutes);
router.use("/reminders", reminderRoutes);
/** 2. Deal Setup*/
router.use("/deals", dealRoutes);

/** 3. Contract Setup*/
router.use("/contracts", contractRoutes);

/** 4. CRM system Setup*/
router.use("/pipelines", pipelineRoutes);
router.use("/stages", stageRoutes);

/** 5. Lead & Deal Followup*/
router.use("/followups", followupRoutes);
router.use("/followup-tasks", followupTaskRoutes);
router.use("/followup-meetings", followupMeetingRoutes);
router.use("/followup-calls", followupCallRoutes);
/** 6. Contact Setup*/
router.use("/contacts", contactRoutes);

/** 7. Company Account Setup*/
router.use("/company-accounts", companyAccountRoutes);

/** 8. Inquiry Setup */
router.use("/company-inquiries", companyInquiryRoutes);

/** 9. Inquiry Forms */
router.use("/inquiries-form", inquiryFormRoutes);


/** 10. Custom Forms */
router.use("/custom-forms", customFormRoutes);

/** 11. Form Submissions */
router.use("/form-submissions", formSubmissionRoutes);

//>>>>>>>>>>>>>>  Project Management System  <<<<<<<<<<<<<<<//

router.use("/projects", projectRoutes);
router.use("/project-reports", projectReportRoutes);
router.use("/quotations", quotationsRoutes);
router.use("/milestones", milestoneRoutes);
router.use("/invoices", invoiceRoutes);
router.use("/expenses", expenseRoutes);
router.use("/payments", paymentRoutes);
router.use("/notes", notesRoutes);
router.use("/activities", activityRoutes);

//>>>>>>>>>>>>>>  Task Management System  <<<<<<<<<<<<<<<//

router.use("/tasks", taskRoutes);
router.use("/taskcalendars", taskCalendarRoutes);

//>>>>>>>>>>>>>>  Order Management System  <<<<<<<<<<<<<<<//
router.use("/products", productsRoutes);
router.use("/orders", orderRoutes);
router.use("/bills", billRoutes);

//>>>>>>>>>>>>>>  Others  <<<<<<<<<<<<<<<//
router.use("/labels", labelRoutes);
router.use("/proposals", proposalRoutes);
router.use("/messages", messageRoutes);
router.use("/notifications", notificationRoutes);
router.use("/calendar", calendarRoutes);

router.use("/userss", userRoutes);

router.use("/mail", emailRoutes);

// Add this route
router.get("/api/chat/get-signed-url", async (req, res) => {
  try {
    const { fileUrl } = req.query;
    if (!fileUrl) {
      return res.status(400).json({ error: "File URL is required" });
    }

    // Extract the key from the S3 URL
    const urlParts = new URL(fileUrl);
    const key = decodeURIComponent(urlParts.pathname.substring(1));

    // Generate signed URL with proper ContentType
    const signedUrl = await s3.getSignedUrlPromise("getObject", {
      Bucket: s3.config.bucketName,
      Key: key,
      Expires: 60, // URL expires in 60 seconds
      ResponseContentDisposition: `attachment; filename="${key
        .split("/")
        .pop()}"`,
    });

    res.json({ signedUrl });
  } catch (error) {
    console.error("Error generating signed URL:", error);
    res.status(500).json({ error: "Failed to generate download URL" });
  }
});

// Add this new route for file downloads
router.get("/api/chat/download-file", async (req, res) => {
  try {
    const { fileUrl } = req.query;
    if (!fileUrl) {
      return res.status(400).json({ error: "File URL is required" });
    }

    // Extract the key from the S3 URL
    const urlParts = new URL(fileUrl);
    const key = decodeURIComponent(urlParts.pathname.substring(1));

    // Get the file from S3
    const s3File = await s3
      .getObject({
        Bucket: s3.config.bucketName,
        Key: key,
      })
      .promise();

    // Set appropriate headers
    res.setHeader("Content-Type", s3File.ContentType);
    res.setHeader(
      "Content-Disposition",
      `attachment; filename="${key.split("/").pop()}"`
    );
    res.setHeader("Content-Length", s3File.ContentLength);

    // Send the file
    res.send(s3File.Body);
  } catch (error) {
    console.error("Error downloading file:", error);
    res.status(500).json({ error: "Failed to download file" });
  }
});


export default router;
