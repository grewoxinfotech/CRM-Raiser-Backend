import cron from "node-cron";
import Email from "../models/emailModel.js";
import EmailSettings from "../models/emailSettingModel.js";
import nodemailer from "nodemailer";
import dayjs from "dayjs";
import { handleScheduledEmails } from "../controllers/EmailController/getEmailsController.js";

const initializeEmailCronJob = () => {
  // Schedule cron job to run every 10 seconds for testing
  const cronJob = cron.schedule("*/30 * * * * *", async () => {
    try {
      await handleScheduledEmails();
    } catch (error) {
      console.error("Error in scheduled email check:", error);
    }
  });
  return cronJob;
};

export default initializeEmailCronJob;
