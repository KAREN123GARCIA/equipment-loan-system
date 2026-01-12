import { Injectable } from '@nestjs/common';
import nodemailer, { Transporter } from 'nodemailer';

@Injectable()
export class MailerService {
  private transporter: Transporter | null = null;

  private getTransporter(): Transporter {
    if (this.transporter) return this.transporter;

    const transport = process.env.EMAIL_TRANSPORT || 'console';

    if (transport === 'console') {
      this.transporter = nodemailer.createTransport({
        name: 'console',
        streamTransport: true,
        newline: 'unix',
        buffer: true,
      } as any);
      return this.transporter;
    }

    if (transport === 'mailhog') {
      const host = process.env.MAILHOG_HOST || 'localhost';
      const port = Number(process.env.MAILHOG_PORT || 1025);
      this.transporter = nodemailer.createTransport({ host, port, secure: false });
      return this.transporter;
    }

    const host = process.env.SMTP_HOST;
    const port = Number(process.env.SMTP_PORT || 587);
    const secure = String(process.env.SMTP_SECURE || 'false') === 'true';
    const user = process.env.SMTP_USER;
    const pass = process.env.SMTP_PASS;

    this.transporter = nodemailer.createTransport({
      host,
      port,
      secure,
      auth: user ? { user, pass } : undefined,
    });

    return this.transporter;
  }

  async sendEmail(input: { to: string; subject: string; html: string; text?: string }) {
    const from = process.env.EMAIL_FROM || 'no-reply@example.com';
    const transporter = this.getTransporter();
    const info = await transporter.sendMail({
      from,
      to: input.to,
      subject: input.subject,
      html: input.html,
      text: input.text,
    });
    return { messageId: info.messageId };
  }
}
