import { neon } from "@neondatabase/serverless";
import { config } from "dotenv";

config({ path: ".env" });

const sql = neon(process.env.DATABASE_URL!);

async function main() {
  console.log("Migrating database for Analytics Phase 2...");

  try {
    console.log("Adding analytics columns to 'view_events' table...");
    
    // Thêm cột traffic_source
    try {
      await sql`ALTER TABLE "view_events" ADD COLUMN "traffic_source" text DEFAULT 'direct' NOT NULL`;
      console.log("Added column 'traffic_source' to table 'view_events'.");
    } catch (e: any) {
      console.log("Column 'traffic_source' already exists or error:", e.message);
    }

    // Thêm cột country
    try {
      await sql`ALTER TABLE "view_events" ADD COLUMN "country" text`;
      console.log("Added column 'country' to table 'view_events'.");
    } catch (e: any) {
      console.log("Column 'country' already exists or error:", e.message);
    }

    // Thêm cột city
    try {
      await sql`ALTER TABLE "view_events" ADD COLUMN "city" text`;
      console.log("Added column 'city' to table 'view_events'.");
    } catch (e: any) {
      console.log("Column 'city' already exists or error:", e.message);
    }

    // Thêm cột device_type
    try {
      await sql`ALTER TABLE "view_events" ADD COLUMN "device_type" text DEFAULT 'desktop' NOT NULL`;
      console.log("Added column 'device_type' to table 'view_events'.");
    } catch (e: any) {
      console.log("Column 'device_type' already exists or error:", e.message);
    }

    // Thêm cột browser
    try {
      await sql`ALTER TABLE "view_events" ADD COLUMN "browser" text DEFAULT 'unknown' NOT NULL`;
      console.log("Added column 'browser' to table 'view_events'.");
    } catch (e: any) {
      console.log("Column 'browser' already exists or error:", e.message);
    }

    console.log("Analytics Migration completed successfully!");
  } catch (error) {
    console.error("Migration failed:", error);
    process.exit(1);
  }
}

main();
