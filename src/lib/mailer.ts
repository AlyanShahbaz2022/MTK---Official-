import 'server-only';
import nodemailer, { type Transporter } from 'nodemailer';

/**
 * Email transport (Gmail SMTP via Nodemailer).
 *
 * Configure with an app password (NOT your normal Gmail password):
 *   SMTP_USER  = your gmail address
 *   SMTP_PASS  = 16-char app password
 *   SMTP_FROM  = optional display "MTK <you@gmail.com>"; defaults to SMTP_USER
 */
const user = process.env.SMTP_USER;
const pass = process.env.SMTP_PASS;

export const isMailerConfigured = Boolean(user && pass);

let _transporter: Transporter | null = null;

function getTransporter(): Transporter {
  if (!user || !pass) {
    throw new Error('Email is not configured (missing SMTP_USER / SMTP_PASS).');
  }
  if (!_transporter) {
    _transporter = nodemailer.createTransport({
      service: 'gmail',
      auth: { user, pass },
    });
  }
  return _transporter;
}

function fromAddress(): string {
  return process.env.SMTP_FROM || `MTK <${user}>`;
}

export interface SendMailInput {
  to: string;
  subject: string;
  html: string;
  text?: string;
}

export async function sendMail({ to, subject, html, text }: SendMailInput) {
  const transporter = getTransporter();
  await transporter.sendMail({
    from: fromAddress(),
    to,
    subject,
    html,
    text,
  });
}
