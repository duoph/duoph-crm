import { createClient } from "@supabase/supabase-js";

const ADMIN_EMAIL = "duophtechnologies@gmail.com";
const ADMIN_PASSWORD = "Relax&D3";
const ADMIN_NAME = "duoph";

function requireEnv(name) {
  const v = process.env[name];
  if (!v) throw new Error(`Missing ${name}`);
  return v;
}

async function main() {
  if (process.env.RESET_USERS_CONFIRM !== "YES") {
    throw new Error('Refusing to run. Set RESET_USERS_CONFIRM="YES" to proceed.');
  }

  const url = requireEnv("NEXT_PUBLIC_SUPABASE_URL");
  const serviceKey = requireEnv("SUPABASE_SERVICE_ROLE_KEY");
  const supabase = createClient(url, serviceKey, {
    auth: { autoRefreshToken: false, persistSession: false },
  });

  // Delete all auth users
  let page = 1;
  const perPage = 200;
  for (;;) {
    const { data, error } = await supabase.auth.admin.listUsers({ page, perPage });
    if (error) throw error;
    const users = data.users;
    if (!users.length) break;

    for (const u of users) {
      const { error: delErr } = await supabase.auth.admin.deleteUser(u.id);
      if (delErr) throw delErr;
      process.stdout.write(`deleted ${u.email ?? u.id}\n`);
    }

    if (users.length < perPage) break;
    page += 1;
  }

  // Cleanup common tables (ignore if missing)
  await supabase.from("signup_pending").delete().neq("email", "");
  await supabase.from("password_reset_tokens").delete().neq("id", "");

  // Create admin
  const { data: created, error: createErr } = await supabase.auth.admin.createUser({
    email: ADMIN_EMAIL,
    password: ADMIN_PASSWORD,
    email_confirm: true,
    user_metadata: { admin_name: ADMIN_NAME },
  });
  if (createErr) throw createErr;

  process.stdout.write(`created admin ${created.user?.email ?? ADMIN_EMAIL}\n`);
}

main().catch((e) => {
  console.error(e?.message ?? e);
  process.exit(1);
});

