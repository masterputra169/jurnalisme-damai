import { Pool } from "pg";
import * as dotenv from "dotenv";

dotenv.config({ path: ".env" });

const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
  max: 2,
});

async function main() {
  const client = await pool.connect();
  try {
    console.log("Adding anonymousSessionId column...");
    await client.query(`
      ALTER TABLE "Reaction"
      ADD COLUMN IF NOT EXISTS "anonymousSessionId" TEXT;
    `);
    console.log("  Column added.");

    console.log("Creating unique index...");
    await client.query(`
      CREATE UNIQUE INDEX IF NOT EXISTS "Reaction_replyId_anonymousSessionId_type_key"
      ON "Reaction" ("replyId", "anonymousSessionId", "type")
      WHERE "anonymousSessionId" IS NOT NULL;
    `);
    console.log("  Index created.");

    console.log("Done.");
  } finally {
    client.release();
    await pool.end();
  }
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});
