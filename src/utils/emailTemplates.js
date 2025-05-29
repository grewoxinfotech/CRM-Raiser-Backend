import { FRONTEND_URL } from "../config/config.js";

const getCommonEmailTemplate = (content) => {
  return `
<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Email Notification</title>
    <style>
        body {
            font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif;
            background-color: #f5f7fa;
            margin: 0;
            padding: 0;
            color: #2d3748;
        }
        .container {
            background-color: #ffffff;
            max-width: 600px;
            margin: 40px auto;
            padding: 30px;
            border-radius: 12px;
            box-shadow: 0 8px 20px rgba(0, 0, 0, 0.05);
        }
        .logo {
            text-align: center;
            margin-bottom: 30px;
        }
        .logo img {
            height: 60px;
            width: auto;
        }
        h1 {
            text-align: center;
            color: #1a202c;
            font-size: 26px;
            margin-bottom: 20px;
        }
        p {
            margin: 14px 0;
            font-size: 16px;
            color: #4a5568;
        }
        .otp {
            font-size: 30px;
            font-weight: bold;
            text-align: center;
            background-color: #f0f4f8;
            color: #2b6cb0;
            padding: 16px;
            border-radius: 8px;
            letter-spacing: 4px;
            margin: 24px 0;
        }
        a {
            display: inline-block;
            background-color: #2b6cb0;
            color: #ffffff;
            padding: 12px 24px;
            text-decoration: none;
            border-radius: 6px;
            font-weight: 500;
            transition: background-color 0.3s ease;
        }
        a:hover {
            background-color: #2c5282;
        }
        ul {
            background-color: #f7fafc;
            padding: 20px;
            border-radius: 8px;
            margin: 20px 0;
        }
        li {
            padding: 8px 0;
            border-bottom: 1px solid #e2e8f0;
            color: #4a5568;
        }
        li:last-child {
            border-bottom: none;
        }
        .footer {
            text-align: center;
            font-size: 13px;
            color: #a0aec0;
            margin-top: 30px;
            padding-top: 20px;
            border-top: 1px solid #e2e8f0;
        }
        .invoice-details {
            background-color: #f8fafc;
            padding: 20px;
            border-radius: 8px;
            margin: 20px 0;
        }
        .amount {
            font-size: 24px;
            font-weight: bold;
            color: #2b6cb0;
            text-align: center;
            margin: 20px 0;
        }
        .status-tag {
            display: inline-block;
            padding: 6px 12px;
            border-radius: 20px;
            font-size: 14px;
            font-weight: 500;
            text-transform: capitalize;
        }
        .status-unpaid {
            background-color: #fee2e2;
            color: #dc2626;
        }
        .status-paid {
            background-color: #dcfce7;
            color: #16a34a;
        }
        .status-partially_paid {
            background-color: #fef9c3;
            color: #ca8a04;
        }
        .buttons {
            text-align: center;
            margin: 30px 0;
        }
        .buttons a {
            margin: 0 10px;
        }
        .view-button {
            background-color: #4f46e5;
        }
        .pay-button {
            background-color: #16a34a;
        }
    </style>
</head>
<body>
    <div class="container">
        <div class="logo">
            <img src="https://www.grewox.com/wp-content/uploads/2025/02/logo.png" alt="Grewox Infotech Logo">
        </div>
        ${content}
        <div class="footer">
            <p>Raiser CRM | All rights reserved</p>
        </div>
    </div>
</body>
</html>
`;
};

export const getWelcomeEmailTemplate = (username) => {
  const content = `
        <h1>Welcome to CRM</h1>
        <p>Dear ${username},</p>
        <p>Thank you for joining our CRM management platform.</p>
        <p style="text-align: center;">
            <a href="${FRONTEND_URL}/login">Get Started</a>
        </p>
    `;
  return getCommonEmailTemplate(content);
};

export const getPasswordResetEmailTemplate = (username, otp) => {
  const content = `
        <h1>Password Reset Request</h1>
        <p>Dear ${username},</p>
        <p>We received a request to reset your password. Here's your OTP:</p>
        <div class="otp">${otp}</div>
        <p style="text-align: center; color: #64748b;">This OTP will expire in 10 minutes.</p>
        <p style="text-align: center;">If you didn't request this, please ignore this email.</p>
    `;
  return getCommonEmailTemplate(content);
};

export const getVerificationEmailTemplate = (username, otp) => {
  const content = `
        <h1>Verify Your Email</h1>
        <p>Dear ${username},</p>
        <p>Welcome to CRM! Please verify your email with this OTP:</p>
        <div class="otp">${otp}</div>
        <p style="text-align: center; color: #64748b;">This OTP will expire in 5 minutes.</p>
    `;
  return getCommonEmailTemplate(content);
};

export const getPlanBuyEmailTemplate = (username, plan, billUrl) => {
  const content = `
        <h1>Plan Purchase Confirmation</h1>
        <p>Dear ${username},</p>
        <p>Congratulations! You have successfully purchased the "${plan.name}" plan.</p>
        <p>Plan details:</p>
        <ul>
            <li>Plan Name: ${plan.name}</li>
            <li>Duration: ${plan.duration}</li>
            <li>Trial Period: ${plan.trial_period}</li>
            <li>Price: ${plan.price}</li>
            <li>Users: ${plan.max_users}</li>
            <li>Clients: ${plan.max_clients}</li>
            <li>Storage: ${plan.storage_limit}</li>
        </ul>
        <p style="text-align: center;">
            <a href="${billUrl}">Download Invoice</a>
        </p>
    `;
  return getCommonEmailTemplate(content);
};

export const getInvoiceEmailTemplate = (customerName, invoice, viewUrl) => {
  const formatCurrency = (amount) => {
    return new Intl.NumberFormat("en-IN", {
      style: "currency",
      currency: invoice.currency || "INR",
    }).format(amount);
  };

  const getStatusClass = (status) => {
    switch (status) {
      case "paid":
        return "status-paid";
      case "partially_paid":
        return "status-partially_paid";
      default:
        return "status-unpaid";
    }
  };

  const getStatusEmoji = (status) => {
    switch (status) {
      case "paid":
        return "✅";
      case "partially_paid":
        return "⚠️";
      default:
        return "❌";
    }
  };

  const content = `
        <div class="email-wrapper">
            <div class="header">
              
                <h1>Invoice from Raiser CRM</h1>
            </div>

            <div class="greeting">
                <p>Hello ${customerName},</p>
                <p>Thank you for your business! Here are your invoice details:</p>
            </div>
            
            <div class="invoice-card">
                <div class="invoice-header">
                    <div class="invoice-number">
                        <span class="label">Invoice No.</span>
                        <span class="value">#${
                          invoice.salesInvoiceNumber
                        }</span>
                    </div>
                    <div class="status ${getStatusClass(
                      invoice.payment_status
                    )}">
                        ${getStatusEmoji(
                          invoice.payment_status
                        )} ${invoice.payment_status.toUpperCase()}
                    </div>
                </div>

                <div class="invoice-details">
                    <div class="detail-row">
                        <span class="label">Issue Date</span>
                        <span class="value">${new Date(
                          invoice.issueDate
                        ).toLocaleDateString("en-IN", {
                          day: "2-digit",
                          month: "short",
                          year: "numeric",
                        })}</span>
                    </div>
                    <div class="detail-row">
                        <span class="label">Due Date</span>
                        <span class="value">${new Date(
                          invoice.dueDate
                        ).toLocaleDateString("en-IN", {
                          day: "2-digit",
                          month: "short",
                          year: "numeric",
                        })}</span>
                    </div>
                    <div class="detail-row amount-row">
                        <span class="label">Amount Due</span>
                        <span class="value amount">${formatCurrency(
                          invoice.total
                        )}</span>
                    </div>
                </div>

                <div class="action-buttons">
                    <a href="${viewUrl}" class="button view-button">View Invoice</a>
                    ${
                      invoice.payment_status !== "paid"
                        ? `
                        <a href="${
                          invoice.upiLink || viewUrl
                        }" class="button pay-button">Pay Now</a>
                    `
                        : ""
                    }
                </div>
            </div>

            ${
              invoice.additional_notes
                ? `
                <div class="notes-section">
                    <h3>Additional Notes</h3>
                    <p>${invoice.additional_notes}</p>
                </div>
            `
                : ""
            }

            <div class="help-section">
                <h3>Need Help?</h3>
                <p>If you have any questions about this invoice, please don't hesitate to reach out to us.</p>
            </div>

            <div class="footer">
                <div class="social-links">
                    <a href="https://www.facebook.com/Raiser" class="social-link">Facebook</a>
                    <a href="https://www.linkedin.com/company/Raiser" class="social-link">LinkedIn</a>
                    <a href="https://www.twitter.com/Raiser" class="social-link">Twitter</a>
                </div>
                <div class="company-info">
                    <p>Raiser CRM</p>
                    <p>Making Business Simple</p>
                </div>
            </div>
        </div>
    `;

  return getCommonEmailTemplate(`
        <style>
            .email-wrapper {
                max-width: 600px;
                margin: 0 auto;
                padding: 20px;
            }
            .header {
                text-align: center;
                margin-bottom: 30px;
            }
            .header img.logo {
                height: 60px;
                margin-bottom: 20px;
            }
            .header h1 {
                color: #1a202c;
                font-size: 28px;
                margin: 0;
                font-weight: 700;
            }
            .greeting {
                margin-bottom: 30px;
                color: #4a5568;
                font-size: 16px;
                line-height: 1.6;
            }
            .invoice-card {
                background: #ffffff;
                border-radius: 12px;
                box-shadow: 0 4px 6px rgba(0, 0, 0, 0.05);
                overflow: hidden;
                margin-bottom: 30px;
                border: 1px solid #e2e8f0;
            }
            .invoice-header {
                background: #f7fafc;
                padding: 20px;
                display: flex;
                justify-content: space-between;
                align-items: center;
                border-bottom: 1px solid #e2e8f0;
            }
            .invoice-number {
                display: flex;
                flex-direction: column;
            }
            .invoice-number .label {
                font-size: 14px;
                color: #718096;
                margin-bottom: 4px;
            }
            .invoice-number .value {
                font-size: 20px;
                font-weight: 600;
                color: #2d3748;
            }
            .status {
                padding: 8px 16px;
                border-radius: 20px;
                font-size: 14px;
                font-weight: 600;
            }
            .status-paid {
                background-color: #c6f6d5;
                color: #2f855a;
            }
            .status-partially_paid {
                background-color: #fefcbf;
                color: #975a16;
            }
            .status-unpaid {
                background-color: #fed7d7;
                color: #c53030;
            }
            .invoice-details {
                padding: 20px;
            }
            .detail-row {
                display: flex;
                justify-content: space-between;
                align-items: center;
                padding: 12px 0;
                border-bottom: 1px solid #edf2f7;
            }
            .detail-row:last-child {
                border-bottom: none;
            }
            .detail-row .label {
                color: #718096;
                font-size: 14px;
            }
            .detail-row .value {
                color: #2d3748;
                font-weight: 500;
                font-size: 14px;
            }
            .amount-row {
                margin-top: 12px;
                padding-top: 16px;
                border-top: 2px solid #edf2f7;
            }
            .amount-row .value.amount {
                font-size: 24px;
                font-weight: 700;
                color: #2d3748;
            }
            .action-buttons {
                padding: 20px;
                background: #f7fafc;
                display: flex;
                gap: 12px;
                justify-content: center;
            }
            .button {
                padding: 12px 24px;
                border-radius: 8px;
                font-weight: 600;
                font-size: 14px;
                text-decoration: none;
                text-align: center;
                transition: all 0.2s ease;
            }
            .view-button {
                background-color: #4299e1;
                color: white;
            }
            .view-button:hover {
                background-color: #3182ce;
            }
            .pay-button {
                background-color: #48bb78;
                color: white;
            }
            .pay-button:hover {
                background-color: #38a169;
            }
            .notes-section {
                background: #f7fafc;
                padding: 20px;
                border-radius: 8px;
                margin-bottom: 30px;
            }
            .notes-section h3 {
                color: #2d3748;
                font-size: 16px;
                margin: 0 0 12px 0;
            }
            .notes-section p {
                color: #4a5568;
                font-size: 14px;
                line-height: 1.6;
                margin: 0;
            }
            .help-section {
                text-align: center;
                margin-bottom: 30px;
            }
            .help-section h3 {
                color: #2d3748;
                font-size: 16px;
                margin: 0 0 8px 0;
            }
            .help-section p {
                color: #718096;
                font-size: 14px;
                line-height: 1.6;
                margin: 0;
            }
            .footer {
                text-align: center;
                padding-top: 20px;
                border-top: 1px solid #e2e8f0;
            }
            .social-links {
                margin-bottom: 16px;
            }
            .social-link {
                color: #4a5568;
                text-decoration: none;
                font-size: 14px;
                margin: 0 8px;
            }
            .social-link:hover {
                color: #2d3748;
            }
            .company-info {
                color: #718096;
                font-size: 12px;
                line-height: 1.6;
            }
            .company-info p {
                margin: 0;
            }
        </style>
        ${content}
    `);
};
