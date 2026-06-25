import { Pool } from "pg";
import * as dotenv from "dotenv";

dotenv.config();

const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
  max: 2,
});

const CATEGORIES = [
  { name: "Infrastruktur & Transportasi", slug: "infrastruktur" },
  { name: "Otomotif", slug: "otomotif" },
  { name: "Properti", slug: "properti" },
  { name: "Wisata & Kuliner", slug: "wisata-kuliner" },
  { name: "Daerah", slug: "daerah" },
];

async function main() {
  const client = await pool.connect();
  try {
    console.log("Inserting categories...");
    for (const cat of CATEGORIES) {
      const { rows } = await client.query(
        'SELECT id FROM "Category" WHERE slug = $1',
        [cat.slug]
      );
      if (rows.length > 0) {
        console.log(`  SKIP: ${cat.slug} already exists`);
      } else {
        await client.query(
          'INSERT INTO "Category" (id, name, slug) VALUES (gen_random_uuid(), $1, $2)',
          [cat.name, cat.slug]
        );
        console.log(`  CREATED: ${cat.slug}`);
      }
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
