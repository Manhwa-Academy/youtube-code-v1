import { sql, eq } from "drizzle-orm";
import { db } from "@/db";
import { videos } from "@/db/schema";

/**
 * Distributes Thumbnail A vs Thumbnail B randomly (50/50),
 * increments impressions asynchronously in the database,
 * and sets the active thumbnailUrl for list views.
 */
export async function processABTesting<T extends { id: string; thumbnailUrl: string | null; thumbnailBUrl: string | null }>(
  items: T[]
): Promise<(T & { thumbnailType: "a" | "b" })[]> {
  return Promise.all(
    items.map(async (item) => {
      if (item.thumbnailBUrl) {
        const choice = Math.random() < 0.5 ? "a" : "b";

        // Increment impression in the background
        (async () => {
          try {
            if (choice === "a") {
              await db
                .update(videos)
                .set({ thumbnailAViews: sql`${videos.thumbnailAViews} + 1` })
                .where(eq(videos.id, item.id));
            } else {
              await db
                .update(videos)
                .set({ thumbnailBViews: sql`${videos.thumbnailBViews} + 1` })
                .where(eq(videos.id, item.id));
            }
          } catch (e) {
            console.error(`[AB_TESTING] Failed to register impression for video ${item.id}:`, e);
          }
        })();

        return {
          ...item,
          thumbnailUrl: choice === "a" ? item.thumbnailUrl : item.thumbnailBUrl,
          thumbnailType: choice,
        };
      }
      
      return {
        ...item,
        thumbnailType: "a",
      };
    })
  );
}
