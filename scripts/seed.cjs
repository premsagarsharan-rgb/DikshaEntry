const bcrypt = require("bcryptjs");
const { MongoClient } = require("mongodb");
const dotenv = require("dotenv");

dotenv.config({ path: ".env.local" });

const uri = process.env.MONGODB_URI;
const metaDbName = process.env.APP_META_DB || "appmeta";

async function run() {
  if (!uri) throw new Error("MONGODB_URI missing in .env.local");

  const client = new MongoClient(uri);
  await client.connect();

  const db = client.db(metaDbName);

  const passwordHash = await bcrypt.hash("admin123", 10);

  await db.collection("users").updateOne(
    { userId: "admin", role: "admin" },
    {
      $setOnInsert: {
        userId: "admin",
        role: "admin",
        passwordHash,
        createdAt: new Date(),
      },
    },
    { upsert: true }
  );

  console.log("Seed done. Admin login:");
  console.log("userId: admin");
  console.log("password: admin123");

  await client.close();
}

run().catch((e) => {
  console.error(e);
  process.exit(1);
});
