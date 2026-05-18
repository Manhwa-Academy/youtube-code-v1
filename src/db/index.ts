import { neon } from "@neondatabase/serverless";
import { drizzle } from "drizzle-orm/neon-http";

if (!process.env.DATABASE_URL) {
  throw new Error("DATABASE_URL is not defined in the environment variables.");
}

// For neon-http (HTTP REST queries), using a PgBouncer connection pooler (-pooler) is redundant
// and prone to connection timeouts during database cold starts. Connecting directly to the
// non-pooling host is highly reliable and much faster.
let connectionString = process.env.DATABASE_URL;
if (connectionString.includes("-pooler")) {
  connectionString = connectionString.replace("-pooler", "");
}

const sql = neon(connectionString);
export const db = drizzle({ client: sql });

