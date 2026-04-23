import { NextResponse } from "next/server";
import { z } from "zod";
import { randomBytes } from "crypto";
import { createAdminClient } from "@/lib/supabase/admin";
import { findAuthUserByEmail } from "@/lib/auth/admin-users";
import { sendPasswordResetEmail } from "@/lib/email/send";
import { hashResetToken } from "@/lib/crypto/otp";

const bodySchema = z.object({
  email: z.string().email(),
});

export async function POST(req: Request) {
  try {
    const json = await req.json();
    const parsed = bodySchema.safeParse(json);
    if (!parsed.success) {
      return NextResponse.json({ error: "Invalid email" }, { status: 400 });
    }
    const email = parsed.data.email.toLowerCase();
    const admin = createAdminClient();
    const authUser = await findAuthUserByEmail(admin, email);
    const userId = authUser?.id;

    if (!userId) {
      return NextResponse.json({ ok: true });
    }

    const token = randomBytes(32).toString("hex");
    const token_hash = hashResetToken(token);
    const expires_at = new Date(Date.now() + 60 * 60 * 1000).toISOString();

    await admin.from("password_reset_tokens").delete().eq("user_id", userId);
    const { error } = await admin.from("password_reset_tokens").insert({
      user_id: userId,
      token_hash,
      expires_at,
    });
    if (error) {
      console.error(error);
      return NextResponse.json({ error: "Could not start reset" }, { status: 500 });
    }

    const base = process.env.APP_URL ?? "http://localhost:3000";
    const resetUrl = `${base}/auth/reset-password?token=${encodeURIComponent(token)}`;

    try {
      await sendPasswordResetEmail(email, resetUrl);
    } catch (e) {
      console.error(e);
      return NextResponse.json({ error: "Could not send email" }, { status: 500 });
    }

    return NextResponse.json({ ok: true });
  } catch (e) {
    console.error(e);
    return NextResponse.json({ error: "Server error" }, { status: 500 });
  }
}
