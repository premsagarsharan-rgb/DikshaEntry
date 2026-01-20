export function todayKey() {
  const d = new Date();
  const yyyy = d.getFullYear();
  const mm = String(d.getMonth() + 1).padStart(2, "0");
  const dd = String(d.getDate()).padStart(2, "0");
  return `${yyyy}_${mm}_${dd}`;
}

export function tempDbNameForToday() {
  const prefix = process.env.TEMP_DB_PREFIX || "temp_";
  return `${prefix}${todayKey()}`;
}
