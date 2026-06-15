import { MongoClient } from "mongodb";
import bcrypt from "bcryptjs";

const ADMIN_EMAIL = "duophtechnologies@gmail.com";
const ADMIN_PASSWORD = "Duoph@123";
const ADMIN_NAME = "duoph";

function requireEnv(name) {
  const v = process.env[name];
  if (!v) throw new Error(`Missing ${name}`);
  return v;
}

async function main() {
  const uri = requireEnv("MONGODB_URI");
  const dbName = process.env.MONGODB_DB ?? "dcrm";
  const client = new MongoClient(uri);
  await client.connect();
  const db = client.db(dbName);

  const password_hash = await bcrypt.hash(ADMIN_PASSWORD, 10);
  const result = await db.collection("users").updateOne(
    { email: ADMIN_EMAIL },
    {
      $set: { email: ADMIN_EMAIL, password_hash, admin_name: ADMIN_NAME },
      $setOnInsert: { created_at: new Date(), last_sign_in_at: null },
    },
    { upsert: true },
  );

  const action = result.upsertedCount ? "created" : "updated";
  process.stdout.write(`${action} admin ${ADMIN_EMAIL}\n`);
  await client.close();
}

main().catch((e) => {
  console.error(e?.message ?? e);
  process.exit(1);
});
