import { NextResponse } from "next/server";
import bcrypt from "bcryptjs";
import { z } from "zod";
import { createAdminClient } from "@/lib/supabase/admin";
import { findAuthUserByEmail } from "@/lib/auth/admin-users";
import { sendOtpEmail } from "@/lib/email/send";
import { generateOtp, hashOtp } from "@/lib/crypto/otp";
import { validatePassword } from "@/lib/validation/password";

const bodySchema = z.object({
  email: z.string().email(),
  password: z.string(),
  admin_name: z.string().min(1, "Name required"),
});

export async function POST(req: Request) {
  try {
    const json = await req.json();
    const parsed = bodySchema.safeParse(json);
    if (!parsed.success) {
      return NextResponse.json({ error: parsed.error.flatten().fieldErrors }, { status: 400 });
    }
    const { email, password, admin_name } = parsed.data;
    const pw = validatePassword(password);
    if (!pw.ok) {
      return NextResponse.json({ error: pw.message }, { status: 400 });
    }

    const admin = createAdminClient();
    const existingUser = await findAuthUserByEmail(admin, email);
    if (existingUser) {
      return NextResponse.json({ error: "Email already registered" }, { status: 409 });
    }

    const code = generateOtp();
    const otp_hash = hashOtp(code);
    const password_hash = await bcrypt.hash(password, 10);
    const expires_at = new Date(Date.now() + 15 * 60 * 1000).toISOString();

    await admin.from("signup_pending").delete().eq("email", email.toLowerCase());
    const { error } = await admin.from("signup_pending").insert({
      email: email.toLowerCase(),
      password_hash,
      admin_name,
      otp_hash,
      expires_at,
    });
    if (error) {
      console.error(error);
      const missing =
        error.code === "PGRST205" ||
        (typeof error.message === "string" && error.message.includes("signup_pending"));
      return NextResponse.json(
        {
          error: missing
            ? "Database not ready: run supabase/schema.sql in the Supabase SQL Editor (table signup_pending missing)."
            : "Could not start signup",
        },
        { status: 500 },
      );
    }

    try {
      const { mocked } = await sendOtpEmail(email, code);
      return NextResponse.json({
        ok: true,
        emailMocked: mocked,
      });
    } catch (e) {
      console.error(e);
      const msg = e instanceof Error ? e.message : "";
      const dns = msg.includes("ENOTFOUND") || msg.includes("getaddrinfo");
      if (dns) {
        return NextResponse.json(
          {
            error:
              "SMTP host not found. Set SMTP_HOST (e.g. smtp.gmail.com) in .env.local or use SMTP_MOCK=1 for local testing.",
          },
          { status: 500 },
        );
      }
      if (msg.includes("SMTP_USER") || msg.includes("SMTP_PASS")) {
        return NextResponse.json({ error: msg }, { status: 500 });
      }
      return NextResponse.json(
        {
          error:
            msg && msg.length < 220
              ? msg
              : "Could not send email. Check SMTP_USER, SMTP_PASS, SMTP_FROM, and provider settings.",
        },
        { status: 500 },
      );
    }
  } catch (e) {
    console.error(e);
    return NextResponse.json({ error: "Server error" }, { status: 500 });
  }
}
