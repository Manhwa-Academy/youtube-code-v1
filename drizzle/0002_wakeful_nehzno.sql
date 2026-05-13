CREATE TYPE "public"."moderation_type" AS ENUM('hidden', 'approved', 'manager_mod', 'standard_mod');--> statement-breakpoint
CREATE TABLE "channel_moderations" (
	"creator_id" uuid NOT NULL,
	"viewer_id" uuid NOT NULL,
	"type" "moderation_type" NOT NULL,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL,
	CONSTRAINT "channel_moderations_pk" PRIMARY KEY("creator_id","viewer_id")
);
--> statement-breakpoint
ALTER TABLE "comments" ADD COLUMN "image_url" text;--> statement-breakpoint
ALTER TABLE "comments" ADD COLUMN "timestamp" integer;--> statement-breakpoint
ALTER TABLE "channel_moderations" ADD CONSTRAINT "channel_moderations_creator_id_users_id_fk" FOREIGN KEY ("creator_id") REFERENCES "public"."users"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "channel_moderations" ADD CONSTRAINT "channel_moderations_viewer_id_users_id_fk" FOREIGN KEY ("viewer_id") REFERENCES "public"."users"("id") ON DELETE cascade ON UPDATE no action;