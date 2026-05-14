import { drizzle } from "drizzle-orm/neon-http";
import { sql } from "drizzle-orm";
import dotenv from "dotenv";

dotenv.config({ path: ".env" });

const db = drizzle(process.env.DATABASE_URL!);

async function main() {
  console.log("Forcing add column 'banned' to 'users' table...");
  try {
    // Try with double quotes for table and column names
    await db.execute(sql`ALTER TABLE "users" ADD COLUMN "banned" boolean DEFAULT false NOT NULL;`);
    console.log("Success!");
  } catch (error) {
    console.error("Error:", error);
  }
}

main();
