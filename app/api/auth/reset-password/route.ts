import { NextResponse } from "next/server";
import { z } from "zod";
import { createAdminClient } from "@/lib/supabase/admin";
import { hashResetToken } from "@/lib/crypto/otp";
import { validatePassword } from "@/lib/validation/password";

const bodySchema = z.object({
  token: z.string().min(10),
  password: z.string(),
});

export async function POST(req: Request) {
  try {
    const json = await req.json();
    const parsed = bodySchema.safeParse(json);
    if (!parsed.success) {
      return NextResponse.json({ error: "Invalid payload" }, { status: 400 });
    }
    const { token, password } = parsed.data;
    const pw = validatePassword(password);
    if (!pw.ok) {
      return NextResponse.json({ error: pw.message }, { status: 400 });
    }

    const admin = createAdminClient();
    const token_hash = hashResetToken(token.trim());
    const { data: row, error: fetchErr } = await admin
      .from("password_reset_tokens")
      .select("*")
      .eq("token_hash", token_hash)
      .maybeSingle();

    if (fetchErr || !row) {
      return NextResponse.json({ error: "Invalid or expired link" }, { status: 400 });
    }
    if (new Date(row.expires_at) < new Date()) {
      await admin.from("password_reset_tokens").delete().eq("id", row.id);
      return NextResponse.json({ error: "Link expired" }, { status: 400 });
    }

    const { error: updErr } = await admin.auth.admin.updateUserById(row.user_id, { password });
    if (updErr) {
      console.error(updErr);
      return NextResponse.json({ error: updErr.message }, { status: 500 });
    }

    await admin.from("password_reset_tokens").delete().eq("user_id", row.user_id);

    return NextResponse.json({ ok: true });
  } catch (e) {
    console.error(e);
    return NextResponse.json({ error: "Server error" }, { status: 500 });
  }
}
