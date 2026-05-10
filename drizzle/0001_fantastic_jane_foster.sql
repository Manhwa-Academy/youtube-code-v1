CREATE TYPE "public"."notification_type" AS ENUM('video_like', 'video_comment', 'comment_reply', 'comment_like', 'subscription', 'post_like', 'post_comment');--> statement-breakpoint
CREATE TABLE "notifications" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"user_id" uuid NOT NULL,
	"actor_id" uuid NOT NULL,
	"type" "notification_type" NOT NULL,
	"video_id" uuid,
	"post_id" uuid,
	"comment_id" uuid,
	"is_read" boolean DEFAULT false NOT NULL,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
ALTER TABLE "posts" ADD COLUMN "scheduled_at" timestamp;--> statement-breakpoint
ALTER TABLE "posts" ADD COLUMN "is_edited" boolean DEFAULT false NOT NULL;--> statement-breakpoint
ALTER TABLE "posts" ADD COLUMN "can_comment" boolean DEFAULT true NOT NULL;--> statement-breakpoint
ALTER TABLE "posts" ADD COLUMN "comment_moderation" text DEFAULT 'none' NOT NULL;--> statement-breakpoint
ALTER TABLE "posts" ADD COLUMN "comment_sort" text DEFAULT 'top' NOT NULL;--> statement-breakpoint
ALTER TABLE "posts" ADD COLUMN "show_like_count" boolean DEFAULT true NOT NULL;--> statement-breakpoint
ALTER TABLE "users" ADD COLUMN "handle" text;--> statement-breakpoint
ALTER TABLE "users" ADD COLUMN "handle_updated_at" timestamp;--> statement-breakpoint
ALTER TABLE "users" ADD COLUMN "handle_previous_updated_at" timestamp;--> statement-breakpoint
ALTER TABLE "videos" ADD COLUMN "can_comment" boolean DEFAULT true NOT NULL;--> statement-breakpoint
ALTER TABLE "videos" ADD COLUMN "comment_moderation" text DEFAULT 'none' NOT NULL;--> statement-breakpoint
ALTER TABLE "videos" ADD COLUMN "comment_permission" text DEFAULT 'anyone' NOT NULL;--> statement-breakpoint
ALTER TABLE "videos" ADD COLUMN "comment_sort" text DEFAULT 'top' NOT NULL;--> statement-breakpoint
ALTER TABLE "videos" ADD COLUMN "show_like_count" boolean DEFAULT true NOT NULL;--> statement-breakpoint
ALTER TABLE "notifications" ADD CONSTRAINT "notifications_user_id_users_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."users"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "notifications" ADD CONSTRAINT "notifications_actor_id_users_id_fk" FOREIGN KEY ("actor_id") REFERENCES "public"."users"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "notifications" ADD CONSTRAINT "notifications_video_id_videos_id_fk" FOREIGN KEY ("video_id") REFERENCES "public"."videos"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "notifications" ADD CONSTRAINT "notifications_post_id_posts_id_fk" FOREIGN KEY ("post_id") REFERENCES "public"."posts"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "notifications" ADD CONSTRAINT "notifications_comment_id_comments_id_fk" FOREIGN KEY ("comment_id") REFERENCES "public"."comments"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "users" ADD CONSTRAINT "users_handle_unique" UNIQUE("handle");