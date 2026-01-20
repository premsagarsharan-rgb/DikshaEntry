import { nanoid } from "nanoid";
import { sha256 } from "./crypto";
import { getDb } from "./mongodb";
import { ensureIndexes } from "./ensureIndexes";

const COOKIE = process.env.AUTH_COOKIE_NAME || "sid";
const SESSION_DAYS = Number(process.env.SESSION_DAYS || 7);

export function cookieName() {
  return COOKIE;
}

export async function createSession({ userId, role }) {
  await ensureIndexes();

  const metaDb = await getDb(process.env.APP_META_DB || "appmeta");
  const token = nanoid(64);
  const tokenHash = sha256(token);

  const now = new Date();
  const expiresAt = new Date(now.getTime() + SESSION_DAYS * 24 * 60 * 60 * 1000);

  await metaDb.collection("sessions").insertOne({
    tokenHash,
    userId,
    role, // "admin" | "user"
    createdAt: now,
    expiresAt,
  });

  return { token, expiresAt };
}

export async function getSessionByToken(token) {
  if (!token) return null;

  const metaDb = await getDb(process.env.APP_META_DB || "appmeta");
  const tokenHash = sha256(token);

  const s = await metaDb.collection("sessions").findOne({ tokenHash });
  if (!s) return null;

  if (new Date(s.expiresAt).getTime() <= Date.now()) return null;
  return { userId: s.userId, role: s.role };
}

export async function destroySession(token) {
  if (!token) return;
  const metaDb = await getDb(process.env.APP_META_DB || "appmeta");
  const tokenHash = sha256(token);
  await metaDb.collection("sessions").deleteOne({ tokenHash });
}
