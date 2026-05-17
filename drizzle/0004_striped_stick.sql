CREATE TYPE "public"."subscription_level" AS ENUM('all', 'personalized', 'none');--> statement-breakpoint
CREATE TABLE "notification_preferences" (
	"user_id" uuid NOT NULL,
	"type" "notification_type" NOT NULL,
	"email" boolean DEFAULT true NOT NULL,
	"push" boolean DEFAULT true NOT NULL,
	"in_app" boolean DEFAULT true NOT NULL,
	CONSTRAINT "notification_preferences_pk" PRIMARY KEY("user_id","type")
);
--> statement-breakpoint
CREATE TABLE "push_subscriptions" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"user_id" uuid NOT NULL,
	"endpoint" text NOT NULL,
	"keys" text NOT NULL,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL,
	CONSTRAINT "push_subscriptions_endpoint_unique" UNIQUE("endpoint")
);
--> statement-breakpoint
ALTER TABLE "subscriptions" ADD COLUMN "level" "subscription_level" DEFAULT 'personalized' NOT NULL;--> statement-breakpoint
ALTER TABLE "videos" ADD COLUMN "tags" text[];--> statement-breakpoint
ALTER TABLE "notification_preferences" ADD CONSTRAINT "notification_preferences_user_id_users_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."users"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "push_subscriptions" ADD CONSTRAINT "push_subscriptions_user_id_users_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."users"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
CREATE INDEX "tags_gin_idx" ON "videos" USING gin ("tags");