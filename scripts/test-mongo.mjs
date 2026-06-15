import { MongoClient } from "mongodb";

function requireEnv(name) {
  const v = process.env[name];
  if (!v) throw new Error(`Missing ${name}`);
  return v;
}

async function main() {
  const uri = requireEnv("MONGODB_URI");
  const client = new MongoClient(uri, { serverSelectionTimeoutMS: 10000 });
  await client.connect();
  await client.db(process.env.MONGODB_DB ?? "dcrm").command({ ping: 1 });
  process.stdout.write("MongoDB connection OK\n");
  await client.close();
}

main().catch((e) => {
  console.error(e?.message ?? e);
  process.exit(1);
});
