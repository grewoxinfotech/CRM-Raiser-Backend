import nodemailer from 'nodemailer';
import { EMAIL_CONFIG, SENDGRID_API_KEY } from '../config/config.js';
import Email from '../models/emailModel.js';

const transporter = nodemailer.createTransport({
    ...EMAIL_CONFIG,
    tls: {
        rejectUnauthorized: false // This will handle self-signed certificates
    }
});

export const sendEmail = async (to, subject, html) => {
    try {
        const mailOptions = {
            from: EMAIL_CONFIG.auth.user,
            to,
            subject,
            html
        };
        await transporter.sendMail(mailOptions);

        const email = await Email.create({
            from: EMAIL_CONFIG.auth.user,
            to,
            subject,
            html,
            isRead: false,
            created_by: EMAIL_CONFIG.auth.user,
            updated_by: EMAIL_CONFIG.auth.user
        });

        return email;
    } catch (error) {
        throw new Error(error);
    }
};

import sgMail from '@sendgrid/mail';

sgMail.setApiKey(SENDGRID_API_KEY);

export default sgMail;
