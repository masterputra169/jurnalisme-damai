import { Pool } from "pg";
import * as dotenv from "dotenv";

dotenv.config();

const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
  max: 2,
});

const CATEGORIES = [
  { name: "Ekonomi", slug: "ekonomi" },
];

async function main() {
  const client = await pool.connect();
  try {
    console.log("Inserting ekonomi category...");
    const { rows } = await client.query(
      'SELECT id FROM "Category" WHERE slug = $1',
      ["ekonomi"]
    );
    if (rows.length > 0) {
      console.log("  SKIP: ekonomi already exists");
    } else {
      await client.query(
        'INSERT INTO "Category" (id, name, slug) VALUES (gen_random_uuid(), $1, $2)',
        ["Ekonomi", "ekonomi"]
      );
      console.log("  CREATED: ekonomi");
    }
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
