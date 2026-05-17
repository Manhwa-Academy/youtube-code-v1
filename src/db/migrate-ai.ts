import dotenv from "dotenv";
import { neon } from "@neondatabase/serverless";

dotenv.config({ path: ".env" });

async function run() {
  const databaseUrl = process.env.DATABASE_URL;
  if (!databaseUrl) {
    console.error("DATABASE_URL is not defined in env");
    process.exit(1);
  }

  console.log("Connecting to Neon Postgres to run AI migrations...");
  const sql = neon(databaseUrl);

  try {
    console.log("Enabling vector extension if it does not exist...");
    await sql`CREATE EXTENSION IF NOT EXISTS vector;`;
    console.log("Vector extension verified.");

    console.log("Adding new columns to 'videos' table...");
    
    // Add columns using ALTER TABLE ADD COLUMN IF NOT EXISTS
    await sql`ALTER TABLE videos ADD COLUMN IF NOT EXISTS ai_chapters TEXT;`;
    await sql`ALTER TABLE videos ADD COLUMN IF NOT EXISTS ai_summary TEXT;`;
    await sql`ALTER TABLE videos ADD COLUMN IF NOT EXISTS thumbnail_b_url TEXT;`;
    await sql`ALTER TABLE videos ADD COLUMN IF NOT EXISTS thumbnail_b_key TEXT;`;
    await sql`ALTER TABLE videos ADD COLUMN IF NOT EXISTS thumbnail_a_views INTEGER DEFAULT 0 NOT NULL;`;
    await sql`ALTER TABLE videos ADD COLUMN IF NOT EXISTS thumbnail_b_views INTEGER DEFAULT 0 NOT NULL;`;
    await sql`ALTER TABLE videos ADD COLUMN IF NOT EXISTS thumbnail_a_clicks INTEGER DEFAULT 0 NOT NULL;`;
    await sql`ALTER TABLE videos ADD COLUMN IF NOT EXISTS thumbnail_b_clicks INTEGER DEFAULT 0 NOT NULL;`;
    await sql`ALTER TABLE videos ADD COLUMN IF NOT EXISTS embedding vector(1536);`;
    await sql`ALTER TABLE videos ADD COLUMN IF NOT EXISTS is_flagged BOOLEAN DEFAULT FALSE NOT NULL;`;
    await sql`ALTER TABLE videos ADD COLUMN IF NOT EXISTS flag_reason TEXT;`;

    console.log("Database migrations completed successfully!");
  } catch (error) {
    console.error("Error running migrations:", error);
    process.exit(1);
  }
}

run();
