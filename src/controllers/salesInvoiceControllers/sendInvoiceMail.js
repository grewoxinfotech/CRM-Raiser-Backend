import Joi from "joi";
import validator from "../../utils/validator.js";
import responseHandler from "../../utils/responseHandler.js";
import { EMAIL_FROM, FRONTEND_URL } from "../../config/config.js";
import nodemailer from "nodemailer";
import { getInvoiceEmailTemplate } from "../../utils/emailTemplates.js";
import Activity from "../../models/activityModel.js";
import puppeteer from "puppeteer";

export default {
  validator: validator({
    params: Joi.object({
      id: Joi.string().required(),
    }),
    body: Joi.object({
      invoice: Joi.object().required(),
      customer: Joi.object({
        name: Joi.string().required(),
        email: Joi.string().email().required(),
        contact: Joi.string().allow("", null),
        address: Joi.string().allow("", null),
      }).required(),
      htmlContent: Joi.string().required(),
    }),
  }),

  handler: async (req, res) => {
    try {
      const { invoice, customer, htmlContent } = req.body;
      const { id } = req.params;

      // Configure nodemailer transporter
      const transporter = nodemailer.createTransport({
        service: "gmail",
        auth: {
          user: process.env.SMTP_USER,
          pass: process.env.SMTP_PASS,
        },
      });

      // Generate PDF using puppeteer
      const browser = await puppeteer.launch({
        headless: "new",
        args: [
          "--no-sandbox",
          "--disable-setuid-sandbox",
          "--disable-dev-shm-usage",
        ],
      });
      const page = await browser.newPage();

      // Set viewport for A4 size
      await page.setViewport({
        width: 794, // A4 width in pixels at 96 DPI
        height: 1123, // A4 height in pixels at 96 DPI
        deviceScaleFactor: 2,
      });

      // Add custom styles for PDF
      const styleContent = `
        @page {
            size: A4;
            margin: 0;
        }
        body {
            margin: 0;
            padding: 20px;
            font-family: 'Segoe UI', sans-serif;
            background: white;
        }
        .invoice-container {
            width: 100%;
            min-height: 100%;
            background: white;
            padding: 30px;
            box-sizing: border-box;
        }
        .invoice-header {
            background: #f0f7ff;
            padding: 24px;
            border-bottom: 1px solid #e5e7eb;
        }
        .company-info {
            display: flex;
            justify-content: space-between;
            align-items: flex-start;
            margin-bottom: 24px;
        }
        .company-left {
            display: flex;
            gap: 16px;
            align-items: center;
        }
        .company-logo {
            width: 80px;
            height: 80px;
            border-radius: 20px;
            background: white;
            padding: 8px;
            box-shadow: 0 2px 4px rgba(0, 0, 0, 0.05);
        }
        .company-name {
            font-size: 32px;
            font-weight: 900;
            color: #1f2937;
            margin-bottom: 4px;
            text-transform: uppercase;
        }
        .company-address {
            color: #6b7280;
            font-size: 14px;
        }
        .company-right {
            text-align: right;
            font-size: 14px;
            color: #1f2937;
        }
        .invoice-title {
            display: flex;
            justify-content: space-between;
            align-items: center;
            margin-top: 16px;
        }
        .title-text {
            font-size: 24px;
            font-weight: 700;
            color: #1f2937;
        }
        .gstin-text {
            color: #1f2937;
            font-size: 18px;
            font-weight: 700;
        }
        .invoice-details {
            padding: 12px 24px;
            background: #fff;
            border-bottom: 1px solid #e5e7eb;
        }
        .details-grid {
            display: grid;
            grid-template-columns: repeat(4, 1fr);
            gap: 24px;
        }
        .detail-item {
            display: flex;
            flex-direction: column;
            gap: 4px;
        }
        .detail-label {
            font-size: 13px;
            color: #6b7280;
            font-weight: 500;
        }
        .detail-value {
            font-size: 13px;
            color: #111827;
            font-weight: 600;
        }
        .customer-details {
            background: #fff;
            border-bottom: 1px solid #e5e7eb;
        }
        .customer-header {
            background: #f9fafb;
            padding: 8px 24px;
            font-size: 14px;
            font-weight: 700;
            color: #374151;
            border-bottom: 1px solid #e5e7eb;
        }
        .customer-grid {
            display: grid;
            grid-template-columns: 1fr 1fr;
            padding: 16px 24px;
            gap: 24px;
        }
        .info-group {
            display: flex;
            flex-direction: column;
        }
        .info-row {
            display: flex;
            align-items: flex-start;
            font-size: 13px;
            line-height: 1.4;
            margin-bottom: 8px;
        }
        .label {
            width: 60px;
            color: #6b7280;
            font-weight: 500;
        }
        .value {
            flex: 1;
            color: #111827;
            padding-left: 12px;
        }
        .items-table {
            width: 100%;
            border-collapse: collapse;
            margin: 16px;
            font-size: 13px;
        }
        .items-table th,
        .items-table td {
            padding: 8px 12px;
            border: 1px solid #e5e7eb;
            text-align: left;
        }
        .items-table th {
            background: #f9fafb;
            font-weight: 500;
            color: #374151;
        }
        .items-table td {
            color: #1f2937;
        }
        .totals-section {
            margin: 16px;
        }
        .total-row {
            display: flex;
            justify-content: space-between;
            padding: 8px 12px;
            border: 1px solid #e5e7eb;
            border-top: none;
            font-size: 13px;
        }
        .total-label {
            color: #6b7280;
        }
        .total-value {
            font-weight: 500;
            color: #111827;
        }
        .credit-note {
            color: #dc2626;
        }
        .payment-section {
            background: #f9fafb;
            padding: 20px;
            display: grid;
            grid-template-columns: auto 1fr;
            gap: 24px;
            border: 1px solid #f0f0f0;
            margin: 16px;
        }
        .qr-code {
            text-align: center;
        }
        .qr-code svg {
            padding: 16px;
            background: white;
            border-radius: 8px;
            box-shadow: 0 1px 3px rgba(0, 0, 0, 0.1);
        }
        .bank-details {
            position: relative;
            padding: 20px;
            background: #f8f9fa;
            border-radius: 8px;
            border: 1px solid #e5e7eb;
        }
        .bank-details h4 {
            margin-bottom: 16px;
            font-size: 16px;
            font-weight: 600;
            color: #1f2937;
        }
        .powered-by {
            margin: 12px;
            text-align: center;
            color: #9CA3AF;
            font-size: 12px;
            line-height: 1.5;
            letter-spacing: 0.5px;
        }
        .paid-stamp {
            position: absolute;
            top: 0;
            right: 0;
            background: linear-gradient(135deg, #10b981 0%, #059669 100%);
            padding: 8px 16px;
            border-bottom-left-radius: 16px;
            display: flex;
            align-items: center;
            gap: 6px;
            box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
        }
        .paid-icon {
            color: white;
            font-size: 16px;
            font-weight: bold;
        }
        .paid-text {
            color: white;
            font-size: 14px;
            font-weight: 600;
            letter-spacing: 0.5px;
        }
      `;

      // Set the content directly with custom styles
      await page.setContent(
        `
        <html>
            <head>
                <style>${styleContent}</style>
            </head>
            <body>
                <div class="invoice-container">
                    ${htmlContent}
                </div>
            </body>
        </html>
        `,
        {
          waitUntil: ["domcontentloaded", "networkidle0"],
          timeout: 30000,
        }
      );

      // Wait for any images to load
      await page.evaluate(async () => {
        const images = document.querySelectorAll("img");
        await Promise.all(
          [...images].map((img) => {
            if (img.complete) return;
            return new Promise((resolve, reject) => {
              img.addEventListener("load", resolve);
              img.addEventListener("error", resolve);
            });
          })
        );
      });

      // Generate PDF with proper settings
      const pdf = await page.pdf({
        format: "A4",
        printBackground: true,
        margin: {
          top: "20px",
          right: "20px",
          bottom: "20px",
          left: "20px",
        },
        preferCSSPageSize: true,
        displayHeaderFooter: false,
      });

      await browser.close();

      // Get email template
      const emailTemplate = getInvoiceEmailTemplate(
        customer.name,
        invoice,
        `${FRONTEND_URL}/dashboard/sales/invoice/${invoice.salesInvoiceNumber}`
      );

      // Prepare email data
      const mailOptions = {
        from: {
          name: req.user?.username || "Raiser CRM",
          address: EMAIL_FROM,
        },
        to: customer.email,
        subject: `Invoice #${invoice.salesInvoiceNumber} from ${
          req.user?.username || "Raiser CRM"
        }`,
        html: emailTemplate,
        attachments: [
          {
            filename: `Invoice-${invoice.salesInvoiceNumber}.pdf`,
            content: pdf,
            contentType: "application/pdf",
          },
        ],
      };

      // Send email
      await transporter.sendMail(mailOptions);

      // Log activity
      await Activity.create({
        related_id: id,
        activity_from: "sales_invoice",
        activity_id: invoice.id,
        action: "email_sent",
        performed_by: req.user?.username,
        client_id: req.des?.client_id,
        activity_message: `Invoice #${invoice.salesInvoiceNumber} sent via email to ${customer.email}`,
      });

      return responseHandler.success(
        res,
        "Invoice sent successfully via email"
      );
    } catch (error) {
      console.error("Error sending invoice email:", error);
      return responseHandler.error(
        res,
        error?.message || "Failed to send invoice email"
      );
    }
  },
};
