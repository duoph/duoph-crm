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

export async function sendOtpEmail(to: string, code: string): Promise<{ mocked: boolean }> {
  if (shouldMockSmtp()) {
    console.warn(
      `[DCRM SMTP mock] OTP for ${to}: ${code} — set real SMTP in .env.local to send email (see .env.example).`,
    );
    return { mocked: true };
  }
  const transport = getTransport();
  await transport.sendMail({
    from: fromAddress(),
    to,
    subject: "Your DCRM verification code",
    text: `Your DCRM verification code is: ${code}. It expires in 15 minutes.`,
    html: `<p>Your DCRM verification code is:</p><p style="font-size:24px;font-weight:bold;letter-spacing:0.05em">${code}</p><p>It expires in 15 minutes.</p><p style="color:#666;font-size:12px">If you did not request this, you can ignore this email.</p>`,
  });
  return { mocked: false };
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
