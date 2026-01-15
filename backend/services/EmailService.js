import nodemailer from 'nodemailer';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import handlebars from 'handlebars';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

class EmailService {
    constructor() {
        this.transporter = null;
        this.initTransporter();
    }

    initTransporter() {
        if (process.env.SMTP_HOST && process.env.SMTP_USER) {
            this.transporter = nodemailer.createTransport({
                host: process.env.SMTP_HOST,
                port: process.env.SMTP_PORT || 587,
                secure: false, // true for 465, false for other ports
                auth: {
                    user: process.env.SMTP_USER,
                    pass: process.env.SMTP_PASS,
                },
            });
            console.log("✅ SMTP Transporter initialized with host:", process.env.SMTP_HOST);
        } else {
            console.warn("⚠️ SMTP Config missing. Emails will NOT be sent.");
        }
    }

    async sendEmail(to, subject, templateName, data) {
        try {
            const html = await this.loadTemplate(templateName, data);

            if (this.transporter) {
                const info = await this.transporter.sendMail({
                    from: `"${process.env.FROM_NAME || 'Krishi Sanchay'}" <${process.env.FROM_EMAIL || 'no-reply@krishisanchay.com'}>`,
                    to,
                    subject,
                    html,
                });

                return info;
            } else {

                console.log(`[MOCK EMAIL] To: ${to}, Subject: ${subject}`);
                return { messageId: 'fake-id' };
            }
        } catch (error) {
            console.error('EmailService Error:', error);
            throw error;
        }
    }

    async loadTemplate(templateName, data) {
        const templatePath = path.join(__dirname, '../templates/emails', `${templateName}.html`);

        try {
            const templateSource = await fs.promises.readFile(templatePath, 'utf8');
            const template = handlebars.compile(templateSource);
            return template(data);
        } catch (error) {
            console.error(`Error loading template ${templateName}:`, error);
            throw new Error('Email template could not be loaded');
        }
    }
}

export default new EmailService();
