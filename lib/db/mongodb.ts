import "server-only";

import { MongoClient, type Db } from "mongodb";

const uri = process.env.MONGODB_URI;

declare global {
  // eslint-disable-next-line no-var
  var _mongoClient: MongoClient | undefined;
}

let client: MongoClient | null = null;
let db: Db | null = null;
let indexesEnsured = false;

export const COL = {
  users: "users",
  clients: "clients",
  cashflow: "cashflow",
  work_types: "work_types",
  work_items: "work_items",
  password_reset_tokens: "password_reset_tokens",
} as const;

async function ensureIndexes(database: Db) {
  if (indexesEnsured) return;
  await Promise.all([
    database.collection(COL.users).createIndex({ email: 1 }, { unique: true }),
    database.collection(COL.password_reset_tokens).createIndex({ user_id: 1 }),
    database.collection(COL.password_reset_tokens).createIndex({ token_hash: 1 }),
    database.collection(COL.work_types).createIndex({ key: 1 }, { unique: true }),
    database.collection(COL.work_items).createIndex({ deleted_at: 1 }),
    database.collection(COL.work_items).createIndex({ client_id: 1 }),
    database.collection(COL.clients).createIndex({ created_at: -1 }),
    database.collection(COL.cashflow).createIndex({ date: -1 }),
  ]);
  const wt = database.collection(COL.work_types);
  await wt.updateOne(
    { key: "website" },
    { $setOnInsert: { key: "website", label: "Website", created_at: new Date() } },
    { upsert: true },
  );
  await wt.updateOne(
    { key: "social_media" },
    { $setOnInsert: { key: "social_media", label: "Social Media", created_at: new Date() } },
    { upsert: true },
  );
  await wt.updateOne(
    { key: "branding" },
    { $setOnInsert: { key: "branding", label: "Branding", created_at: new Date() } },
    { upsert: true },
  );
  await wt.updateOne(
    { key: "other" },
    { $setOnInsert: { key: "other", label: "Other", created_at: new Date() } },
    { upsert: true },
  );
  indexesEnsured = true;
}

export async function getDb(): Promise<Db> {
  if (!uri) throw new Error("Missing MONGODB_URI");
  if (db) return db;
  client = global._mongoClient ?? new MongoClient(uri);
  if (process.env.NODE_ENV !== "production") global._mongoClient = client;
  await client.connect();
  db = client.db(process.env.MONGODB_DB ?? "dcrm");
  await ensureIndexes(db);
  return db;
}
