import nodemailer from "nodemailer";
import { env } from "../config/env.js";
import logger from "../utils/logger.js";

const transporter = nodemailer.createTransport({
    host: env.SMTP_HOST,
    port: env.SMTP_PORT,
    secure: env.SMTP_SECURE, // true for 465, false for other ports
    auth: {
        user: env.SMTP_USER,
        pass: env.SMTP_PASS,
    },
});

export const emailService = {
    async sendEmail(to: string, subject: string, html: string) {
        try {
            const info = await transporter.sendMail({
                from: env.EMAIL_FROM,
                to,
                subject,
                html,
            });
            logger.info({ messageId: info.messageId, to }, 'Email sent successfully');
            return info;
        } catch (error) {
            logger.error({ error, to, subject }, 'Error sending email');
            throw new Error("Failed to send email");
        }
    },

    async sendInvitationEmail(email: string, tempPassword: string) {
        const subject = "Welcome to Nexus - Your Account Credentials";
        const html = `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
        <h2>Welcome to Nexus!</h2>
        <p>You have been invited to join the Nexus Project Management System.</p>
        <p>Here are your temporary login credentials:</p>
        <div style="background-color: #f4f4f4; padding: 15px; border-radius: 5px; margin: 20px 0;">
          <p><strong>Email:</strong> ${email}</p>
          <p><strong>Temporary Password:</strong> ${tempPassword}</p>
        </div>
        <p>Please log in and change your password immediately.</p>
        <p><a href="${env.FRONTEND_URL}/login" style="background-color: #007bff; color: white; padding: 10px 20px; text-decoration: none; border-radius: 5px;">Login to Nexus</a></p>
      </div>
    `;
        return this.sendEmail(email, subject, html);
    },
};
