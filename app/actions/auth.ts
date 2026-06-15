"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { clearSessionCookie, createSessionToken, setSessionCookie } from "@/lib/auth/session";
import { touchLastSignIn, userToSession, verifyUserPassword } from "@/lib/auth/users";

export async function loginAction(_prev: { error?: string } | null, formData: FormData) {
  const email = String(formData.get("email") ?? "")
    .trim()
    .toLowerCase();
  const password = String(formData.get("password") ?? "").trim();
  const next = String(formData.get("next") ?? "/dashboard");

  let destination = "/dashboard";
  try {
    const user = await verifyUserPassword(email, password);
    if (!user) {
      return { error: "Invalid email or password" };
    }
    await touchLastSignIn(user._id.toString());
    const token = await createSessionToken(userToSession(user));
    await setSessionCookie(token);
    revalidatePath("/", "layout");
    destination = next.startsWith("/") ? next : "/dashboard";
  } catch (e) {
    console.error("[loginAction]", e);
    const msg = e instanceof Error ? e.message : "";
    if (msg.includes("bad auth") || msg.includes("Authentication failed")) {
      return { error: "Database connection failed. Check MONGODB_URI in .env.local." };
    }
    return { error: "Sign in failed. Try again later." };
  }
  redirect(destination);
}

export async function logoutAction() {
  await clearSessionCookie();
  revalidatePath("/", "layout");
  redirect("/auth/login");
}
