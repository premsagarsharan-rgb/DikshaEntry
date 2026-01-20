import { getDb } from "./mongodb";

let ensured = false;

export async function ensureIndexes() {
  if (ensured) return;
  ensured = true;

  const metaDb = await getDb(process.env.APP_META_DB || "appmeta");

  // sessions TTL
  await metaDb.collection("sessions").createIndex(
    { expiresAt: 1 },
    { expireAfterSeconds: 0 }
  );

  // form sessions TTL
  await metaDb.collection("formSessions").createIndex(
    { expiresAt: 1 },
    { expireAfterSeconds: 0 }
  );

  // users unique
  await metaDb.collection("users").createIndex(
    { userId: 1 },
    { unique: true }
  );

  console.log("[ensureIndexes] OK");
}
