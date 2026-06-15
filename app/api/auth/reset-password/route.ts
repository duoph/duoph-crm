import { NextResponse } from "next/server";
import { z } from "zod";
import { COL, getDb } from "@/lib/db/mongodb";
import { updateUserPassword } from "@/lib/auth/users";
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

    const db = await getDb();
    const token_hash = hashResetToken(token.trim());
    const row = await db.collection(COL.password_reset_tokens).findOne({ token_hash });

    if (!row) {
      return NextResponse.json({ error: "Invalid or expired link" }, { status: 400 });
    }
    if (new Date(row.expires_at as Date) < new Date()) {
      await db.collection(COL.password_reset_tokens).deleteOne({ _id: row._id });
      return NextResponse.json({ error: "Link expired" }, { status: 400 });
    }

    await updateUserPassword(row.user_id as string, password);
    await db.collection(COL.password_reset_tokens).deleteMany({ user_id: row.user_id });

    return NextResponse.json({ ok: true });
  } catch (e) {
    console.error(e);
    return NextResponse.json({ error: "Server error" }, { status: 500 });
  }
}
