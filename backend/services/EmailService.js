import nodemailer from 'nodemailer';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

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
        } else {

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
            let template = await fs.promises.readFile(templatePath, 'utf8');

            // Simple template engine: replace {{key}} with data[key]
            Object.keys(data).forEach(key => {
                const regex = new RegExp(`{{${key}}}`, 'g');
                template = template.replace(regex, data[key]);
            });

            return template;
        } catch (error) {
            console.error(`Error loading template ${templateName}:`, error);
            throw new Error('Email template could not be loaded');
        }
    }
}

export default new EmailService();
