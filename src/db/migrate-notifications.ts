import { drizzle } from "drizzle-orm/neon-http";
import { sql } from "drizzle-orm";
import * as dotenv from "dotenv";

dotenv.config();

const db = drizzle(process.env.DATABASE_URL!);

async function main() {
  console.log("Migrating database for notifications...");
  
  // 1. Create enum subscription_level
  try {
    await db.execute(sql`CREATE TYPE "public"."subscription_level" AS ENUM('all', 'personalized', 'none')`);
    console.log("Created type 'subscription_level'.");
  } catch (error: any) {
    if (error.message && error.message.includes("already exists")) {
      console.log("Type 'subscription_level' already exists. Skipping.");
    } else {
      console.error("Error creating type 'subscription_level':", error);
    }
  }

  // 2. Create table notification_preferences
  try {
    await db.execute(sql`
      CREATE TABLE IF NOT EXISTS "notification_preferences" (
        "user_id" uuid NOT NULL,
        "type" "notification_type" NOT NULL,
        "email" boolean DEFAULT true NOT NULL,
        "push" boolean DEFAULT true NOT NULL,
        "in_app" boolean DEFAULT true NOT NULL,
        CONSTRAINT "notification_preferences_pk" PRIMARY KEY("user_id","type")
      )
    `);
    console.log("Created table 'notification_preferences'.");
  } catch (error) {
    console.error("Error creating table 'notification_preferences':", error);
  }

  // 3. Create table push_subscriptions
  try {
    await db.execute(sql`
      CREATE TABLE IF NOT EXISTS "push_subscriptions" (
        "id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
        "user_id" uuid NOT NULL,
        "endpoint" text NOT NULL,
        "keys" text NOT NULL,
        "created_at" timestamp DEFAULT now() NOT NULL,
        "updated_at" timestamp DEFAULT now() NOT NULL,
        CONSTRAINT "push_subscriptions_endpoint_unique" UNIQUE("endpoint")
      )
    `);
    console.log("Created table 'push_subscriptions'.");
  } catch (error) {
    console.error("Error creating table 'push_subscriptions':", error);
  }

  // 4. Alter table subscriptions (add level)
  try {
    await db.execute(sql`
      ALTER TABLE "subscriptions" 
      ADD COLUMN IF NOT EXISTS "level" "subscription_level" DEFAULT 'personalized' NOT NULL
    `);
    console.log("Added column 'level' to table 'subscriptions'.");
  } catch (error) {
    console.error("Error altering table 'subscriptions':", error);
  }

  // 5. Alter table videos (add tags)
  try {
    await db.execute(sql`
      ALTER TABLE "videos" 
      ADD COLUMN IF NOT EXISTS "tags" text[]
    `);
    console.log("Added column 'tags' to table 'videos'.");
  } catch (error) {
    console.error("Error altering table 'videos':", error);
  }

  // 6. Add foreign keys
  try {
    await db.execute(sql`
      ALTER TABLE "notification_preferences" 
      ADD CONSTRAINT "notification_preferences_user_id_users_id_fk" 
      FOREIGN KEY ("user_id") REFERENCES "public"."users"("id") ON DELETE cascade ON UPDATE no action
    `);
    console.log("Added foreign key constraint to 'notification_preferences'.");
  } catch (error: any) {
    if (error.message && error.message.includes("already exists")) {
      console.log("Foreign key constraint on 'notification_preferences' already exists.");
    } else {
      console.error("Error adding constraint to 'notification_preferences':", error);
    }
  }

  try {
    await db.execute(sql`
      ALTER TABLE "push_subscriptions" 
      ADD CONSTRAINT "push_subscriptions_user_id_users_id_fk" 
      FOREIGN KEY ("user_id") REFERENCES "public"."users"("id") ON DELETE cascade ON UPDATE no action
    `);
    console.log("Added foreign key constraint to 'push_subscriptions'.");
  } catch (error: any) {
    if (error.message && error.message.includes("already exists")) {
      console.log("Foreign key constraint on 'push_subscriptions' already exists.");
    } else {
      console.error("Error adding constraint to 'push_subscriptions':", error);
    }
  }

  // 7. Create tags index
  try {
    await db.execute(sql`
      CREATE INDEX IF NOT EXISTS "tags_gin_idx" ON "videos" USING gin ("tags")
    `);
    console.log("Created index 'tags_gin_idx' on table 'videos'.");
  } catch (error) {
    console.error("Error creating index 'tags_gin_idx':", error);
  }

  console.log("Migration completed.");
}

main();
