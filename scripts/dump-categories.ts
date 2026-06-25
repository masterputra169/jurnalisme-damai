import { Pool } from "pg";
import * as dotenv from "dotenv";

dotenv.config();

const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
  max: 2,
});

async function main() {
  const client = await pool.connect();
  const { rows } = await client.query(
    'SELECT id, name, slug, length(slug) as slen FROM "Category" ORDER BY slug'
  );
  console.log("Categories in DB:");
  rows.forEach((r) =>
    console.log(`  slug: ${JSON.stringify(r.slug)} len: ${r.slen} name: ${r.name}`)
  );
  client.release();
  await pool.end();
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});
