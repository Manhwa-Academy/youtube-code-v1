type SSEClient = {
  id: string;
  controller: ReadableStreamDefaultController;
};

// Global map of connected clients by userId
// Declared as global to persist during Next.js hot-reloads in development
const globalForSSE = globalThis as unknown as {
  sseClients?: Map<string, SSEClient[]>;
};

export const clients = globalForSSE.sseClients ?? new Map<string, SSEClient[]>();

if (process.env.NODE_ENV !== "production") {
  globalForSSE.sseClients = clients;
}

export function registerSSEClient(userId: string, controller: ReadableStreamDefaultController): string {
  const clientId = Math.random().toString(36).substring(2, 9);
  
  if (!clients.has(userId)) {
    clients.set(userId, []);
  }
  
  clients.get(userId)!.push({ id: clientId, controller });
  console.log(`[SSE] Client ${clientId} registered for user ${userId}. Total clients for user: ${clients.get(userId)!.length}`);
  
  return clientId;
}

export function unregisterSSEClient(userId: string, clientId: string) {
  const userClients = clients.get(userId);
  if (!userClients) return;
  
  const updatedClients = userClients.filter(c => c.id !== clientId);
  if (updatedClients.length === 0) {
    clients.delete(userId);
  } else {
    clients.set(userId, updatedClients);
  }
  console.log(`[SSE] Client ${clientId} unregistered for user ${userId}.`);
}

export function sendRealTimeNotification(userId: string, data: any) {
  const userClients = clients.get(userId);
  if (!userClients || userClients.length === 0) {
    console.log(`[SSE] No active SSE connections for user ${userId}. Notification will only be stored in DB.`);
    return false;
  }
  
  const encoder = new TextEncoder();
  const message = `data: ${JSON.stringify(data)}\n\n`;
  const encodedMessage = encoder.encode(message);
  
  let successCount = 0;
  
  for (const client of userClients) {
    try {
      client.controller.enqueue(encodedMessage);
      successCount++;
    } catch (err) {
      console.error(`[SSE] Error sending notification to client ${client.id} of user ${userId}:`, err);
    }
  }
  
  console.log(`[SSE] Broadcasted notification to ${successCount}/${userClients.length} active clients of user ${userId}.`);
  return successCount > 0;
}
