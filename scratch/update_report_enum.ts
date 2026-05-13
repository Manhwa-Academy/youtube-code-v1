import { drizzle } from "drizzle-orm/neon-http";
import { sql } from "drizzle-orm";
import dotenv from "dotenv";

dotenv.config({ path: ".env" });

const db = drizzle(process.env.DATABASE_URL!);

async function main() {
  console.log("Updating report_type enum to include 'post'...");
  try {
    await db.execute(sql`ALTER TYPE "report_type" ADD VALUE 'post';`);
    console.log("Enum updated successfully!");
  } catch (error) {
    // If it already exists, just ignore
    console.error("Error updating enum (it might already have 'post'):", error);
  }
}

main();
