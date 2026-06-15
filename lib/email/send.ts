import nodemailer from "nodemailer";

const PLACEHOLDER_HOSTS = new Set(["", "smtp.example.com", "localhost-smtp-placeholder"]);

function shouldMockSmtp(): boolean {
  if (process.env.SMTP_MOCK === "1" || process.env.SMTP_MOCK === "true") return true;
  const host = (process.env.SMTP_HOST ?? "").trim();
  if (PLACEHOLDER_HOSTS.has(host)) return true;
  return false;
}

function getTransport() {
  const host = process.env.SMTP_HOST?.trim();
  if (!host) {
    throw new Error("SMTP_HOST is not set");
  }
  const port = Number(process.env.SMTP_PORT ?? "587");
  const user = process.env.SMTP_USER?.trim();
  const pass = process.env.SMTP_PASS;
  if (!user || !pass) {
    throw new Error(
      "SMTP_USER and SMTP_PASS are required to send mail. For Gmail, use an App Password (Google Account → Security → 2-Step Verification → App passwords).",
    );
  }
  const secure = port === 465 || process.env.SMTP_SECURE === "1" || process.env.SMTP_SECURE === "true";

  return nodemailer.createTransport({
    host,
    port,
    secure,
    auth: { user, pass },
    ...(!secure && port !== 465 ? { requireTLS: true } : {}),
  });
}

function fromAddress(): string {
  const from = process.env.SMTP_FROM?.trim();
  if (from) return from;
  const user = process.env.SMTP_USER?.trim();
  if (user) return user;
  return "noreply@localhost";
}

export async function sendPasswordResetEmail(to: string, resetUrl: string) {
  if (shouldMockSmtp()) {
    console.warn(`[DCRM SMTP mock] Password reset for ${to}: ${resetUrl}`);
    return;
  }
  const transport = getTransport();
  await transport.sendMail({
    from: fromAddress(),
    to,
    subject: "Reset your DCRM password",
    text: `Reset your password: ${resetUrl}`,
    html: `<p>Reset your DCRM password:</p><p><a href="${resetUrl}">${resetUrl}</a></p><p>This link expires in one hour.</p>`,
  });
}
