import { drizzle } from "drizzle-orm/neon-http";
import { sql } from "drizzle-orm";
import dotenv from "dotenv";

dotenv.config({ path: ".env" });

const db = drizzle(process.env.DATABASE_URL!);

async function main() {
  console.log("Checking columns for 'users' table...");
  try {
    const res = await db.execute(sql`SELECT column_name FROM information_schema.columns WHERE table_name = 'users';`);
    console.log("Columns:", res);
  } catch (error) {
    console.error("Error:", error);
  }
}

main();
