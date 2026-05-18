CREATE TABLE "clips" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"title" text NOT NULL,
	"video_id" uuid NOT NULL,
	"user_id" uuid NOT NULL,
	"start_time" integer NOT NULL,
	"end_time" integer NOT NULL,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
ALTER TABLE "categories" DROP CONSTRAINT "categories_name_unique";--> statement-breakpoint
ALTER TABLE "users" DROP CONSTRAINT "users_clerk_id_unique";--> statement-breakpoint
ALTER TABLE "videos" ADD COLUMN "ai_chapters" text;--> statement-breakpoint
ALTER TABLE "videos" ADD COLUMN "ai_summary" text;--> statement-breakpoint
ALTER TABLE "videos" ADD COLUMN "thumbnail_b_url" text;--> statement-breakpoint
ALTER TABLE "videos" ADD COLUMN "thumbnail_b_key" text;--> statement-breakpoint
ALTER TABLE "videos" ADD COLUMN "thumbnail_a_views" integer DEFAULT 0 NOT NULL;--> statement-breakpoint
ALTER TABLE "videos" ADD COLUMN "thumbnail_b_views" integer DEFAULT 0 NOT NULL;--> statement-breakpoint
ALTER TABLE "videos" ADD COLUMN "thumbnail_a_clicks" integer DEFAULT 0 NOT NULL;--> statement-breakpoint
ALTER TABLE "videos" ADD COLUMN "thumbnail_b_clicks" integer DEFAULT 0 NOT NULL;--> statement-breakpoint
ALTER TABLE "videos" ADD COLUMN "embedding" vector(1536);--> statement-breakpoint
ALTER TABLE "videos" ADD COLUMN "is_flagged" boolean DEFAULT false NOT NULL;--> statement-breakpoint
ALTER TABLE "videos" ADD COLUMN "flag_reason" text;--> statement-breakpoint
ALTER TABLE "clips" ADD CONSTRAINT "clips_video_id_videos_id_fk" FOREIGN KEY ("video_id") REFERENCES "public"."videos"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "clips" ADD CONSTRAINT "clips_user_id_users_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."users"("id") ON DELETE cascade ON UPDATE no action;