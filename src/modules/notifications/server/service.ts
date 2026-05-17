import { db } from "@/db";
import { notifications, notificationPreferences, pushSubscriptions, users, videos, posts, comments } from "@/db/schema";
import { eq, and } from "drizzle-orm";
import { sendRealTimeNotification } from "@/lib/sse";
import { sendPushNotification } from "@/lib/webpush";

export type NotificationInput = {
  userId: string;       // recipient
  actorId: string;      // actor triggering the notification
  type: "video_like" | "video_comment" | "comment_reply" | "comment_like" | "subscription" | "post_like" | "post_comment";
  videoId?: string;
  postId?: string;
  commentId?: string;
};

export async function dispatchNotification(input: NotificationInput) {
  const { userId, actorId, type, videoId, postId, commentId } = input;

  // Don't send notification to yourself!
  if (userId === actorId) return;

  // 1. Fetch user's notification preferences
  const [preferences] = await db
    .select()
    .from(notificationPreferences)
    .where(and(eq(notificationPreferences.userId, userId), eq(notificationPreferences.type, type)))
    .limit(1);

  // Default is true if preference row does not exist yet
  const inAppEnabled = preferences ? preferences.inApp : true;
  const pushEnabled = preferences ? preferences.push : true;

  console.log(`[NotificationService] Dispatching ${type} from ${actorId} to ${userId}. Preferences - inApp: ${inAppEnabled}, push: ${pushEnabled}`);

  let dbNotification: any = null;

  // 2. Handle In-App notification (Database insertion + SSE)
  if (inAppEnabled) {
    const [inserted] = await db
      .insert(notifications)
      .values({
        userId,
        actorId,
        type,
        videoId,
        postId,
        commentId,
        isRead: false,
      })
      .returning();

    if (inserted) {
      // Fetch details of actor, video, post, comment to send complete payload via SSE
      const [actor] = await db
        .select({ id: users.id, name: users.name, imageUrl: users.imageUrl })
        .from(users)
        .where(eq(users.id, actorId))
        .limit(1);

      let video = null;
      if (videoId) {
        const [v] = await db
          .select({ id: videos.id, title: videos.title, thumbnailUrl: videos.thumbnailUrl })
          .from(videos)
          .where(eq(videos.id, videoId))
          .limit(1);
        video = v;
      }

      let post = null;
      if (postId) {
        const [p] = await db
          .select({ id: posts.id, content: posts.content })
          .from(posts)
          .where(eq(posts.id, postId))
          .limit(1);
        post = p;
      }

      let comment = null;
      if (commentId) {
        const [c] = await db
          .select({ id: comments.id, value: comments.value, imageUrl: comments.imageUrl })
          .from(comments)
          .where(eq(comments.id, commentId))
          .limit(1);
        comment = c;
      }

      dbNotification = {
        ...inserted,
        actor,
        video,
        post,
        comment,
      };

      // Dispatch via SSE for real-time update
      sendRealTimeNotification(userId, dbNotification);
    }
  }

  // 3. Handle Web Push notification (Browser push service)
  if (pushEnabled) {
    // Get actor info for push message text
    const [actor] = await db
      .select({ name: users.name, imageUrl: users.imageUrl })
      .from(users)
      .where(eq(users.id, actorId))
      .limit(1);

    const actorName = actor?.name || "Ai đó";
    let title = "Thông báo mới";
    let body = `${actorName} đã tương tác với bạn.`;
    let url = "/notifications";

    // Set custom texts based on type
    switch (type) {
      case "video_like":
        title = "Tương tác video";
        body = `${actorName} đã thích video của bạn.`;
        if (videoId) url = `/videos/${videoId}`;
        break;
      case "video_comment":
        title = "Bình luận mới";
        body = `${actorName} đã bình luận về video của bạn.`;
        if (videoId) url = `/videos/${videoId}`;
        break;
      case "comment_reply":
        title = "Phản hồi bình luận";
        body = `${actorName} đã trả lời bình luận của bạn.`;
        if (videoId) url = `/videos/${videoId}`;
        break;
      case "comment_like":
        title = "Tương tác bình luận";
        body = `${actorName} đã thích bình luận của bạn.`;
        if (videoId) url = `/videos/${videoId}`;
        break;
      case "subscription":
        title = "Người đăng ký mới";
        body = `${actorName} đã đăng ký kênh của bạn.`;
        url = `/users/${actorId}`;
        break;
      case "post_like":
        title = "Tương tác bài viết";
        body = `${actorName} đã thích bài viết của bạn.`;
        if (postId) url = `/posts/${postId}`;
        break;
      case "post_comment":
        title = "Bình luận bài viết";
        body = `${actorName} đã bình luận trên bài viết của bạn.`;
        if (postId) url = `/posts/${postId}`;
        break;
    }

    // Fetch user's push subscriptions
    const userSubscriptions = await db
      .select()
      .from(pushSubscriptions)
      .where(eq(pushSubscriptions.userId, userId));

    for (const sub of userSubscriptions) {
      const result = await sendPushNotification(
        { endpoint: sub.endpoint, keys: sub.keys },
        {
          title,
          body,
          icon: actor?.imageUrl || "/icon-192x192.png",
          url: `${process.env.NEXT_PUBLIC_APP_URL || "http://localhost:3000"}${url}`,
        }
      );

      // If the subscription is expired or invalid, delete it from the database!
      if (result && typeof result === "object" && result.expired) {
        console.log(`[NotificationService] Deleting expired push subscription: ${sub.id}`);
        await db.delete(pushSubscriptions).where(eq(pushSubscriptions.id, sub.id));
      }
    }
  }
}
