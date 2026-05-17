import webpush from "web-push";

const publicKey = process.env.NEXT_PUBLIC_VAPID_PUBLIC_KEY;
const privateKey = process.env.VAPID_PRIVATE_KEY;

if (publicKey && privateKey) {
  webpush.setVapidDetails(
    "mailto:vuliztva1@gmail.com",
    publicKey,
    privateKey
  );
  console.log("[WebPush] VAPID details initialized successfully.");
} else {
  console.warn("[WebPush] VAPID keys are missing. Web Push will not function correctly.");
}

export async function sendPushNotification(
  subscription: { endpoint: string; keys: string },
  payload: { title: string; body: string; icon?: string; url?: string }
) {
  try {
    const subObj = {
      endpoint: subscription.endpoint,
      keys: JSON.parse(subscription.keys),
    };
    
    await webpush.sendNotification(
      subObj,
      JSON.stringify(payload)
    );
    console.log(`[WebPush] Successfully sent push notification to endpoint: ${subscription.endpoint}`);
    return true;
  } catch (error: any) {
    console.error(`[WebPush] Error sending push notification:`, error);
    // If the subscription has expired or is no longer valid (status code 410 or 404), return false with status
    if (error.statusCode === 410 || error.statusCode === 404) {
      return { expired: true };
    }
    return false;
  }
}
