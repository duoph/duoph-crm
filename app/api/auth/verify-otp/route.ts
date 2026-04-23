import { NextResponse } from "next/server";
import bcrypt from "bcryptjs";
import { z } from "zod";
import { createAdminClient } from "@/lib/supabase/admin";
import { createServerClient } from "@supabase/ssr";
import { cookies } from "next/headers";
import { hashOtp } from "@/lib/crypto/otp";
import { validatePassword } from "@/lib/validation/password";

const bodySchema = z.object({
  email: z.string().email(),
  otp: z.string().min(4).max(8),
  password: z.string(),
});

export async function POST(req: Request) {
  try {
    const json = await req.json();
    const parsed = bodySchema.safeParse(json);
    if (!parsed.success) {
      return NextResponse.json({ error: "Invalid payload" }, { status: 400 });
    }
    const { email, otp, password } = parsed.data;
    const pw = validatePassword(password);
    if (!pw.ok) {
      return NextResponse.json({ error: pw.message }, { status: 400 });
    }

    const admin = createAdminClient();
    const { data: pending, error: fetchErr } = await admin
      .from("signup_pending")
      .select("*")
      .eq("email", email.toLowerCase())
      .maybeSingle();

    if (fetchErr || !pending) {
      return NextResponse.json({ error: "No pending signup for this email" }, { status: 400 });
    }

    if (new Date(pending.expires_at) < new Date()) {
      await admin.from("signup_pending").delete().eq("email", email.toLowerCase());
      return NextResponse.json({ error: "Code expired. Sign up again." }, { status: 400 });
    }

    const otpOk = pending.otp_hash === hashOtp(otp.trim());
    const passOk = await bcrypt.compare(password, pending.password_hash);
    if (!otpOk || !passOk) {
      return NextResponse.json({ error: "Invalid code or password" }, { status: 401 });
    }

    const { data: created, error: createErr } = await admin.auth.admin.createUser({
      email: email.toLowerCase(),
      password,
      email_confirm: true,
      user_metadata: { admin_name: pending.admin_name },
    });

    if (createErr || !created.user) {
      console.error(createErr);
      return NextResponse.json({ error: createErr?.message ?? "Could not create account" }, { status: 500 });
    }

    await admin.from("signup_pending").delete().eq("email", email.toLowerCase());

    const cookieStore = await cookies();
    const url = process.env.NEXT_PUBLIC_SUPABASE_URL!;
    const key = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!;
    const supabase = createServerClient(url, key, {
      cookies: {
        getAll() {
          return cookieStore.getAll();
        },
        setAll(cookiesToSet) {
          cookiesToSet.forEach(({ name, value, options }) => cookieStore.set(name, value, options));
        },
      },
    });

    const { error: signErr } = await supabase.auth.signInWithPassword({
      email: email.toLowerCase(),
      password,
    });

    if (signErr) {
      return NextResponse.json({ ok: true, needsLogin: true });
    }

    return NextResponse.json({ ok: true, needsLogin: false });
  } catch (e) {
    console.error(e);
    return NextResponse.json({ error: "Server error" }, { status: 500 });
  }
}
