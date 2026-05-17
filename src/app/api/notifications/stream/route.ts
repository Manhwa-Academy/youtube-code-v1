import { NextRequest } from "next/server";
import { auth } from "@clerk/nextjs/server";
import { db } from "@/db";
import { users } from "@/db/schema";
import { eq } from "drizzle-orm";
import { registerSSEClient, unregisterSSEClient } from "@/lib/sse";

export const dynamic = "force-dynamic";

export async function GET(req: NextRequest) {
  const { userId: clerkUserId } = await auth();

  if (!clerkUserId) {
    return new Response("Unauthorized", { status: 401 });
  }

  // Look up user UUID in database
  const [user] = await db
    .select({ id: users.id })
    .from(users)
    .where(eq(users.clerkId, clerkUserId))
    .limit(1);

  if (!user) {
    return new Response("User not found", { status: 404 });
  }

  const userId = user.id;
  let clientId: string;

  const responseStream = new ReadableStream({
    start(controller) {
      clientId = registerSSEClient(userId, controller);
      
      // Send an initial handshake/keep-alive event
      const encoder = new TextEncoder();
      controller.enqueue(encoder.encode("event: open\ndata: Connected to real-time notification stream\n\n"));
      
      // Set up a heartbeat interval every 20 seconds to keep the connection alive
      const interval = setInterval(() => {
        try {
          controller.enqueue(encoder.encode(": keepalive\n\n"));
        } catch (err) {
          // If connection is closed, stop heartbeat
          clearInterval(interval);
        }
      }, 20000);

      // Clean up on stream cancellation/abort
      req.signal.addEventListener("abort", () => {
        clearInterval(interval);
        unregisterSSEClient(userId, clientId);
      });
    },
    cancel() {
      if (clientId) {
        unregisterSSEClient(userId, clientId);
      }
    }
  });

  return new Response(responseStream, {
    headers: {
      "Content-Type": "text/event-stream",
      "Cache-Control": "no-cache, no-transform",
      "Connection": "keep-alive",
      "X-Accel-Buffering": "no", // Disable buffering in Nginx/Vercel
    },
  });
}
